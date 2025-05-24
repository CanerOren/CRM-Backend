const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const moment = require('moment');
const {
  getDataList,
  getData,
  saveData,
  deleteData,
} = require('../../models/core/usersModel');
const { setUser } = require('../../core/controllers/functions');
const { notifyNewUser } = require('../../telegramBot/telegramNotifier');
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
    const user = process.env.EMAIL_USER;
    const password = process.env.EMAIL_PASSWORD;
    var params = req.body;
    params = setUser(params, req.user);
    const userPassword = params.password;
    if (params.hasOwnProperty('password')) {
      if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
      } else {
        delete params.password;
      }
    } else {
      delete params.password;
    }

    response = await saveData(params);
    if (response) {
      status = true;
    }
    if (status) {
      message = 'İşlem başarılı';
      const fullData = await getData(response.id);
      const output_message = `
        <h1>Yeni Kullanıcı Oluşturuldu</h1>
        <ul>
          <li>Adı Soyadı: ${fullData.name} ${fullData.lastname}</li>
          <li>Email: ${fullData.email}</li>
          <li>Şifre: ${userPassword}</li>
          <li>Kullanıcı Tipi: ${fullData.user_type.title}</li>
          <li>Oluşturan: ${fullData.created_by.name || '-'} ${fullData.created_by.lastname || '-'}</li>
          <li>Oluşturulduğu Tarihi: ${moment(fullData.created_at).format('DD-MM-YYYY HH:mm:ss')}</li>
        </ul>`;
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: user,
          pass: password,
        },
      });

      await transporter.sendMail({
        from: `"CRM App Alert" <${user}>`,
        to: 'rondurod@hotmail.com',
        subject: 'New User Created',
        html: output_message,
      });
      await notifyNewUser(fullData, userPassword);
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

module.exports = { index, getRow, createData, removeData };
