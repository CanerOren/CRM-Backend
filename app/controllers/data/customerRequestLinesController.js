const {
  getDataList,
  getData,
  saveData,
  deleteData,
} = require('../../models/data/customerRequestLinesModel');
const { setUser } = require('../../core/controllers/functions');
const customerRequests = require('../../models/data/customerRequestsModel');

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
    if (params.hasOwnProperty('approved')) {
      await customerRequests.saveData({
        id: params.id_customer_requests,
        id_customer_request_statuses: 10,
      });
    } else if (params.hasOwnProperty('denied')) {
      await customerRequests.saveData({
        id: params.id_customer_requests,
        id_customer_request_statuses: 11,
      });
    } else if (params.is_answer === null && params.is_solution === null) {
      await customerRequests.saveData({
        id: params.id_customer_requests,
        id_customer_request_statuses: 7,
      });
    } else if (params.is_solution === true) {
      await customerRequests.saveData({
        id: params.id_customer_requests,
        id_customer_request_statuses: 9,
      });
    } else if (params.is_answer === true) {
      await customerRequests.saveData({
        id: params.id_customer_requests,
        id_customer_request_statuses: 8,
      });
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

module.exports = { index, getRow, createData, removeData };
