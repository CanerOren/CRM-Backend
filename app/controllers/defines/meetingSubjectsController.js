const {
  getData,
  getDataList,
  saveData,
  deleteData,
} = require('../../models/defines/meetingSubjectsModel');
const { setUser } = require('../../core/controllers/functions');

async function index(req, res) {
  try {
    let paramData = req.body;
    if (!paramData) {
      paramData = [];
    }
    const data = await getDataList(paramData);
    res.json({ dataCount: data.dataCount, data: data.data });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
}

async function getRow(req, res) {
  try {
    let paramData = req.body;
    const data = await getData(paramData.id);
    res.json({ data: data });
  } catch (err) {
    console.error('Veri hatas:', err);
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
}

async function createData(req, res) {
  try {
    let status = false;
    let message = null;
    let response = null;
    let params = req.body;
    params = setUser(params, req.user);
    response = await saveData(params);
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
    console.error('Veri hatas:', err);
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
}

async function removeData(req, res) {
  try {
    let status = false;
    let message = null;
    let response = null;
    let params = req.body;
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
    console.error('Veri hatas:', err);
    res.status(500).send({});
  }
}

module.exports = { index, getRow, createData, removeData };
