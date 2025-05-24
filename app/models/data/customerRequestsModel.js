const { PrismaClient } = require('@prisma/client');
const {
  getNowDateTime,
  elements,
} = require('../../core/models/functions/index');

const prisma = new PrismaClient();
const model = prisma.customer_requests;
const columns = [
  'id_customer_request_types',
  'id_customers',
  'id_customer_request_subjects',
  'id_customer_request_importances',
  'id_manager_user',
  'id_customer_request_statuses',
  'notes',
  'id_created_by',
  'id_updated_by',
  'created_at',
  'updated_at',
  'deleted_at',
];
async function getData(id) {
  let result = {};
  if (id) {
    result = await model.findFirst({
      select: {
        id: true,
        id_customers: true,
        customer: {
          select: {
            id: true,
            company: true,
            name: true,
            last_name: true,
            phone: true,
            email: true,
            date_of_birth: true,
            cities: {
              select: {
                title: true,
              },
            },
            districts: {
              select: {
                title: true,
              },
            },
            address: true,
            customer_type: {
              select: {
                title: true,
              },
            },
          },
        },
        id_customer_request_types: true,
        request_type: {
          select: {
            title: true,
          },
        },
        id_customer_request_subjects: true,
        request_subject: {
          select: {
            title: true,
          },
        },
        id_customer_request_importances: true,
        request_importance: {
          select: {
            title: true,
          },
        },
        id_manager_user: true,
        manager_user: {
          select: {
            id: true,
            name: true,
            lastname: true,
          },
        },
        id_customer_request_statuses: true,
        customer_request_statuses: {
          select: {
            title: true,
            status: true,
          },
        },
        notes: true,
        id_created_by: true,
        created_by: {
          select: {
            id: true,
            name: true,
            lastname: true,
          },
        },
        id_updated_by: true,
        updated_by: {
          select: {
            id: true,
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
          id: id,
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
