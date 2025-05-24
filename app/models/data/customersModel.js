const { PrismaClient } = require('@prisma/client');
const {
  getNowDateTime,
  elements,
} = require('../../core/models/functions/index');
const columns = [
  'customer_types',
  'company',
  'name',
  'last_name',
  'date_of_birth',
  'phone',
  'email',
  'id_cities',
  'id_districts',
  'address',
  'id_customer_types',
  'id_created_by',
  'id_updated_by',
  'updated_at',
  'created_at',
  'deleted_at',
];
const prisma = new PrismaClient();
const model = prisma.customers;

async function getData(id) {
  let result = {};
  if (id) {
    result = await model.findFirst({
      select: {
        id: true,
        company: true,
        name: true,
        last_name: true,
        date_of_birth: true,
        phone: true,
        email: true,
        id_cities: true,
        cities: {
          select: {
            title: true,
          },
        },
        id_districts: true,
        districts: {
          select: {
            title: true,
          },
        },
        address: true,
        id_customer_types: true,
        customer_type: {
          select: {
            title: true,
          },
          where: {
            deleted_at: null,
          },
        },
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
    param.created_at = getNowDateTime();
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

module.exports = { getData, saveData, deleteData, getDataList };
