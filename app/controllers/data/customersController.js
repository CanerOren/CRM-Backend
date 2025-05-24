const excelJS = require('exceljs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');
const ejs = require('ejs');
const path = require('path');

const {
  getDataList,
  getData,
  saveData,
  deleteData,
} = require('../../models/data/customersModel');
const { setUser, getTimeFormat } = require('../../core/controllers/functions');

async function index(req, res) {
  try {
    var paramData = req.body;
    if (!paramData) {
      paramData = [];
    }
    const data = await getDataList(paramData);
    res.json({ dataCount: data.dataCount, data: data.data });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function getRow(req, res) {
  try {
    var paramData = req.body;

    const data = await getData(paramData.id);
    res.json({ data: data });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function createData(req, res) {
  try {
    var status = false;
    var message = null;
    var response = null;
    var params = req.body;
    params = setUser(params, req.user);
    if (params.date_of_birth) {
      params.date_of_birth = getTimeFormat(params.date_of_birth);
    }

    response = await saveData(params);
    if (response) {
      status = true;
    }
    if (status) {
      message = 'İşlem başarılı';
    } else {
      message = 'İşlem başarısız';
    }
    res.json({
      status: status,
      message: message,
      id: response,
    });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function removeData(req, res) {
  try {
    var status = false;
    var message = null;
    var response = null;
    var params = req.body;
    params.id_updated_by = req.user.id;
    response = await deleteData(params);
    if (response) {
      status = true;
    }
    if (status) {
      message = 'İşlem başarılı.';
    } else {
      message = 'İşlem başarısız.';
    }
    res.json({
      status: status,
      message: message,
      id: response,
    });
  } catch (err) {
    console.error('Veri hatası', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function exportToExcel(req, res) {
  try {
    let paramData = req.body || {};
    paramData.select = {
      company: true,
      name: true,
      last_name: true,
      date_of_birth: true,
      phone: true,
      email: true,
      cities: {
        select: {
          title: true,
        },
      },
      districts: {
        select: {
          title: true,
        },
      },
      address: true,
      customer_type: {
        select: {
          title: true,
        },
      },
      created_by: {
        select: {
          name: true,
          lastname: true,
        },
      },
      updated_by: {
        select: {
          name: true,
          lastname: true,
        },
      },
      created_at: true,
      updated_at: true,
    };
    const dataResult = await getDataList(paramData);
    const customers = dataResult.data;

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    //Headers
    if (customers.length > 0) {
      worksheet.columns = [
        { header: 'Şirket', key: 'company', width: 20 },
        { header: 'Ad-Soyad', key: 'full_name', width: 20 },
        { header: 'Doğum Tarihi', key: 'date_of_birth', width: 20 },
        { header: 'Telefon Numarası', key: 'phone', width: 20 },
        { header: 'Mail', key: 'email', width: 20 },
        { header: 'Şehir', key: 'city', width: 20 },
        { header: 'Semt', key: 'district', width: 20 },
        { header: 'Adres', key: 'address', width: 20 },
        { header: 'Müşteri Tipi', key: 'customer_type', width: 20 },
        { header: 'Oluşturan', key: 'created_by', width: 20 },
        { header: 'Güncelleyen', key: 'updated_by', width: 20 },
        { header: 'Oluşturulma Tarihi', key: 'created_at', width: 20 },
        { header: 'Güncellenme Tarihi', key: 'updated_at', width: 20 },
      ];
      //Veriler
      customers.forEach((customer) => {
        worksheet.addRow({
          company: customer.company,
          full_name: `${customer.name || ''} ${customer.last_name || ''}`,
          date_of_birth: customer.date_of_birth,
          phone: customer.phone,
          email: customer.email,
          city: customer.cities?.title || '',
          district: customer.districts?.title || '',
          address: customer.address,
          customer_type: customer.customer_type?.title || '',
          created_by: customer.created_by
            ? `${customer.created_by.name || ''} ${customer.created_by.lastname || ''}`
            : '',
          updated_by: customer.updated_by
            ? `${customer.updated_by.name || ''} ${customer.updated_by.lastname || ''}`
            : '',
          created_at: customer.created_at,
          updated_at: customer.updated_at,
        });
      });
    }
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export hatası', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function exportToPdf(req, res) {
  try {
    const customerId = req.query.id;
    const customer = await getData(customerId);

    const templatePath = path.join(__dirname, '../../views/pdfTemplate.ejs');
    const htmlString = fs.readFileSync(templatePath, 'utf8');
    const renderedHtml = ejs.render(htmlString, customer);

    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    await page.setContent(renderedHtml, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="musteri_karti.pdf"',
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF oluşturulurken hata:', err);
    res.status(500).send('PDF oluşturulamadı');
  }
}

module.exports = {
  index,
  getRow,
  createData,
  removeData,
  exportToExcel,
  exportToPdf,
};
