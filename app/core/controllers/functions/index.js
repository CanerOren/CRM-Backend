const moment = require('moment');

function setUser(params, user) {
  if (params.hasOwnProperty('id')) {
    if (params.id) {
      params.id_updated_by = user.id;
    } else {
      params.id_created_by = user.id;
    }
  } else {
    params.id_created_by = user.id;
  }
  return params;
}

function getTimeFormat(date) {
  return date ? moment(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null;
}
module.exports = { setUser, getTimeFormat };
