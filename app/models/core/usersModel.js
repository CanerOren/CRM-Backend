const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

require('dotenv').config();
const abilities = require('../../models/core/abilitiesModel');
const userTypesAbilities = require('../../models/core/userTypesAbilitiesModel');
const {
  getNowDateTime,
  elements,
} = require('../../core/models/functions/index');
const model = prisma.users;
const columns = [
  'id_user_types',
  'name',
  'lastname',
  'email',
  'phone',
  'id_created_by',
  'id_updated_by',
  'created_at',
  'updated_at',
  'deleted_at',
  'password',
  'token',
  'acces_token',
  'refresh_token',
  'download_token',
];
async function getData(id) {
  let result = {};
  if (id) {
    result = await model.findFirst({
      select: {
        id: true,
        name: true,
        lastname: true,
        phone: true,
        email: true,
        user_type: {
          select: {
            title: true,
          },
        },
        id_user_types: true,
        id_created_by: true,
        created_by: {
          select: {
            name: true,
            lastname: true,
          },
        },
        id_updated_by: true,
        updated_by: {
          select: {
            name: true,
            lastname: true,
          },
        },
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
      where: {
        id: Number(id),
        deleted_at: null,
      },
    });
  }

  return result;
}

async function getDataList(param) {
  let result = {
    data: [],
    dataCount: 0,
  };
  if (!param.hasOwnProperty('where')) {
    param.where = {};
  }
  param.where.deleted_at = null;
  if (param.hasOwnProperty('array')) {
    if (param.array === false) {
      delete param.array;
      result.data = await model.findFirst(param);
    }
  } else {
    result.data = await model.findMany(param);

    if (param.hasOwnProperty('take')) {
      delete param.take;
    }
    if (param.hasOwnProperty('skip')) {
      delete param.skip;
    }
    const countData = await model.findMany(param);
    result.dataCount = countData.length;
  }
  return result;
}

async function saveData(param) {
  let result = {};
  if (param.hasOwnProperty('id')) {
    if (param.id) {
      const id = param.id;
      param.updated_at = getNowDateTime();
      result = await model.update({
        where: {
          id: Number(id),
        },
        data: elements(param, columns),
      });
    } else {
      param.created_at = getNowDateTime();
      result = await model.create({ data: elements(param, columns) });
    }
  } else {
    result = await model.create({ data: elements(param, columns) });
  }
  return result;
}

async function deleteData(param) {
  var result = {};
  const data = {
    deleted_at: getNowDateTime(),
    id_updated_by: param.id_updated_by,
  };
  result = await model.update({
    where: {
      id: param.id,
    },
    data: data,
  });
  return result;
}

async function authProvider(dataParam) {
  let token = null;
  let status = false;
  let email = dataParam.email;
  let password = dataParam.password;
  let permissions = [
    {
      action: 'read',
      subject: 'APP_DASHBOARD',
    },
  ];
  var userData = {};
  if (email && password) {
    userData = await getDataList({
      array: false,
      where: {
        email: email,
      },
      select: {
        id: true,
        password: true,
        name: true,
        id_user_types: true,
        lastname: true,
        phone: true,
        email: true,
        user_type: {
          select: {
            title: true,
          },
        },
      },
    });
    if (userData.data) {
      userData = userData.data;

      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (isPasswordValid) {
        const userTypeData = await userTypesAbilities.getDataList({
          where: {
            id_user_types: userData.id_user_types,
          },
        });
        if (userTypeData) {
          var abilitiesIds = [];
          userTypeData.data.forEach((item) => {
            abilitiesIds.push(item.id_abilities);
          });
          const abilityData = await abilities.getDataList({
            where: {
              id: { in: abilitiesIds },
            },
          });
          if (abilityData) {
            abilityData.data.forEach((item) => {
              permissions.push({
                action: 'read',
                subject: item.subject,
              });
            });
            var response = {
              id: userData.id,
              name: userData.name + ' ' + userData.lastname,
              userType: userData.user_type.title,
              id_user_types: userData.id_user_types,
              ability: permissions,
              role: 'client',
            };
            token = jwt.sign(response, process.env.JWT_KEY, {
              expiresIn: '1h',
            });
            response.accessToken = token;

            response.refreshToken = crypto
              .createHash('sha256')
              .update(
                `${userData.name}${userData.lastname}${userData.id}refresh`,
              )
              .digest('hex');
            response.downloadToken = crypto
              .createHash('sha256')
              .update(
                `${userData.name}${userData.lastname}${userData.id}download`,
              )
              .digest('hex');

            const updateToken = await saveData({
              id: userData.id,
              //token: token,
              acces_token: response.accessToken,
              refresh_token: response.refreshToken,
              download_token: response.downloadToken,
            });
            if (updateToken) {
              status = true;
            }
          }
        }
      }
    }
  }
  if (status) {
    userData.ability = response.ability;
    userData.user_type = userData.user_type.title;
    userData.username = userData.name + ' ' + userData.lastname;
    userData.role = response.role;
    return {
      status: status,
      message: 'Giriş İşlemi Başarılı.',
      //token: token,
      userData: userData,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      downloadToken: response.downloadToken,
    };
  } else {
    return {
      status: status,
      message: 'Giriş Başarısız',
      //token: null,
      userData: {},
    };
  }
}

module.exports = { getData, saveData, deleteData, getDataList, authProvider };
