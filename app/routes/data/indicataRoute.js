const express = require('express');
const router = express.Router();

const { authorize } = require('../../middlewares/middleware');
const { getRow } = require('../../controllers/data/indicataController');

router.post('/getRow', authorize, getRow);
module.exports = router;
