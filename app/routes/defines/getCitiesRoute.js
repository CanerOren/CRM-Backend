const express = require('express');
const router = express.Router();

const {
  index,
  getRow,
  createData,
  removeData,
} = require('../../controllers/defines/getCitiesController');

router.post('/', index);
router.post('/getRow', getRow);
router.post('/createData', createData);
router.post('/removeData', removeData);

module.exports = router;
