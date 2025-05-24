const {
  getDataList,
  getData,
  saveData,
  deleteData,
} = require('../../models/data/meetingsModel');
const { setUser } = require('../../core/controllers/functions');
const meetingLines = require('../../models/data/meetingLinesModel');
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
    var meeting_content = null;
    var params = req.body;
    var updating = false;
    params = setUser(params, req.user);
    if (params.id) updating = true;

    if (params.hasOwnProperty('meeting_content')) {
      meeting_content = params.meeting_content;
    }
    response = await saveData(params);
    if (response) {
      status = true;
    }
    if (status) {
      if (!updating) {
        await meetingLines.saveData({
          title: meeting_content,
          id_meetings: response.id,
          id_meeting_contact_types: response.id_meeting_contact_types,
          id_meeting_statuses: response.id_meeting_statuses,
          id_created_by: response.id_created_by,
        });
      }
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
