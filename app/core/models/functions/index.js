function getNowDateTime() {
  return new Date().toISOString();
}

function elements(sendArray, templateArray) {
  var arr = {};
  for (let key in sendArray) {
    if (templateArray.includes(key)) {
      arr[key] = sendArray[key];
    }
  }
  return arr;
}

module.exports = { getNowDateTime, elements };
