const axios = require('axios');

require('dotenv').config();

async function getData(param) {
  const email = process.env.INDICATA_MAIL;
  const password = process.env.INDICATA_PASSWORD;
  let token = await log_in(email, password);

  let config = {
    method: 'POST',
    maxBody: Infinity,
    url: 'https://valuation.tr.indicataapis.com/api/v1/valuation',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: param,
  };
  const response = await axios.request(config);
  return response.data.payload.valuation.acv;
}

async function log_in(email, password) {
  let token = '';
  let data = JSON.stringify({
    email: email,
    password: password,
  });

  let config = {
    method: 'POST',
    maxBodyLength: Infinity,
    url: 'https://valuation.tr.indicataapis.com/api/v1/user/login',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };
  const response = await axios(config);
  return response.data.payload.token;
}
module.exports = { getData };
