const axios = require('axios');

require('dotenv').config();

async function getData(param) {
  const email = process.env.INDICATA_MAIL;
  const password = process.env.INDICATA_PASSWORD;
  let token = log_in(email, password);

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
  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
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
  await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return (token = response.data.token);
    })
    .catch((error) => {
      console.log(error);
    });
}
