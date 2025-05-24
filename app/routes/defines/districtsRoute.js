const express = require('express');
const router = express.Router();

const { authorize } = require('../../middlewares/middleware');

const {
  index,
  getRow,
  createData,
  removeData,
} = require('../../controllers/defines/districtsController');

router.post('/', authorize, index);
router.post('/getRow', authorize, getRow);
router.post('/createData', authorize, createData);
router.post('/removeData', authorize, removeData);

module.exports = router;
