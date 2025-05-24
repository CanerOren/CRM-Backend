const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { getNowDateTime } = require('../../core/models/functions/index');
const model = prisma.abilities;

async function getData(id) {
  let result = {};
  if (id) {
    result = await model.findFirst({
      select: {
        id: true,
        main_group: true,
        groups: true,
        subject: true,
        is_admin: true,
        id_created_by: true,
        id_updated_by: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
      where: {
        id: id,
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
    const id = param.id;
    param.updated_at = getNowDateTime();
    result = await model.update({
      where: {
        id: id,
      },
      data: param,
    });
  } else {
    result = await model.create({ data: param });
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

module.exports = { getData, saveData, deleteData, getDataList };
