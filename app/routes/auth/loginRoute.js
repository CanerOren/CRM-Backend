const {
  index,
  refreshToken,
} = require('../../controllers/auth/loginController');

const express = require('express');
const router = express.Router();

router.post('/login', index);
router.post('/refresh-token', refreshToken);
module.exports = router;
