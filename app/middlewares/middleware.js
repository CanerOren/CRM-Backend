const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const prisma = new PrismaClient();

async function authorize(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      return res.sendStatus(401);
    }
    const decodedToken = jwt.verify(token.trim(), process.env.JWT_KEY);
    req.user = await prisma.users.findFirst({
      where: {
        acces_token: token,
      },
    });
    if (!req.user) {
      return res.sendStatus(401);
    }
    next();
  } catch (err) {
    res.sendStatus(401);
  }
}
async function downloadAuth(req, res, next) {
  try {
    const downloadToken = req.query.token;
    if (downloadToken === null) {
      return res.sendStatus(401);
    }

    req.user = await prisma.users.findFirst({
      where: {
        download_token: downloadToken,
      },
    });
    if (!req.user) {
      res.sendStatus(401);
    }
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}
module.exports = { authorize, downloadAuth };
