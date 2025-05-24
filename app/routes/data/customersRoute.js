const express = require('express');
const router = express.Router();

const { authorize, downloadAuth } = require('../../middlewares/middleware');
const {
  index,
  getRow,
  createData,
  removeData,
  exportToExcel,
  exportToPdf,
} = require('../../controllers/data/customersController');

router.post('/', authorize, index);
router.post('/getRow', authorize, getRow);
router.post('/createData', authorize, createData);
router.post('/removeData', authorize, removeData);
router.get('/exportExcel', downloadAuth, exportToExcel);
router.get('/exportPdf', downloadAuth, exportToPdf);
module.exports = router;
