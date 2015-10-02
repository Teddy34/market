logResult = function(result) {
  console.log(result);
  return result;
};

logError = function(error){
  console.error(error.stack);
  return Promise.reject(error);
};

module.exports = {
  logResult: logResult,
  logError: logError
};