function logResult(result) {
  console.log(result);
  return result;
};

function logError(error){
  console.error(error.stack);
  return Promise.reject(error);
};

function setTimeoutPromised(duration) {
  return new Promise(function(resolve) {
    setTimeout(function() {resolve()},duration);
  });
}

module.exports = {
  logResult: logResult,
  logError: logError,
  setTimeoutPromised: setTimeoutPromised
};