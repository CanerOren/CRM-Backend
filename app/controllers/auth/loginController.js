const usersModel = require('../../models/core/usersModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

async function index(req, res) {
  try {
    let params = req.body;
    const data = await usersModel.authProvider(params);
    if (data) {
      if (data.status) {
        return res.status(200).json(data);
      } else {
        return res.status(401).json(data);
      }
    } else {
      return res.status(500).json(data);
    }
  } catch (err) {
    console.error('Login işlemi sistem hatası', err);
    res.status(500).json({
      error: 'Sistem hatası',
    });
  }
}

async function refreshToken(req, res) {
  try {
    var response = {
      accessToken: null,
      refreshToken: null,
      downloadToken: null,
    };
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.sendStatus(401);
    } else {
      if (refreshToken) {
        let userData = await usersModel.getDataList({
          where: {
            refresh_token: refreshToken,
          },
          array: false,
        });
        if (userData.data) {
          userData = userData.data;
          token = jwt.sign(response, process.env.JWT_KEY, {
            expiresIn: '1h',
          });
          response.accessToken = token;

          response.refreshToken = crypto
            .createHash('sha256')
            .update(`${userData.name}${userData.lastname}${userData.id}refresh`)
            .digest('hex');
          response.downloadToken = crypto
            .createHash('sha256')
            .update(
              `${userData.name}${userData.lastname}${userData.id}download`,
            )
            .digest('hex');

          const updateToken = await usersModel.saveData({
            id: userData.id,
            //token: token,
            acces_token: response.accessToken,
            refresh_token: response.refreshToken,
            download_token: response.downloadToken,
          });
        }
      }
    }
    return res.json(response);
  } catch (err) {
    console.error('Bir hata oluştu', err);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
}

module.exports = { index, refreshToken };
