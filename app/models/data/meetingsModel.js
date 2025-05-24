const { PrismaClient } = require('@prisma/client');
const {
  getNowDateTime,
  elements,
} = require('../../core/models/functions/index');

const prisma = new PrismaClient();
const model = prisma.meetings;
const columns = [
  'id_meeting_types',
  'id_customers',
  'id_meeting_subjects',
  'id_meeting_contact_types',
  'id_meeting_statuses',
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
        id_meeting_types: true,
        id_customers: true,
        id_meeting_subjects: true,
        id_meeting_contact_types: true,
        id_meeting_statuses: true,
        id_created_by: true,
        id_updated_by: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        meeting_type: {
          select: {
            title: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            last_name: true,
            company: true,
            phone: true,
            email: true,
            id_cities: true,
            id_districts: true,
            date_of_birth: true,
            id_customer_types: true,
            address: true,
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
            customer_type: {
              select: {
                title: true,
              },
              where: {
                deleted_at: null,
              },
            },
          },
        },
        subject: {
          select: {
            title: true,
          },
        },
        contact_type: {
          select: {
            title: true,
          },
        },
        status: {
          select: {
            title: true,
            variant: true,
            status: true,
          },
        },
        created_by: {
          select: {
            name: true,
            lastname: true,
          },
        },
        updated_by: {
          select: {
            name: true,
            lastname: true,
          },
        },
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
      delete param.meeting_content;
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
