var _ = require('lodash');

function logResult(result) {
  console.log(result);
  return result;
}

function logError(error){
  console.error(error.stack);
  return Promise.reject(error);
}

function setTimeoutPromised(duration) {
  return new Promise(function(resolve) {
    setTimeout(function() {resolve();},duration);
  });
}

function cacheFunction(myFuncToCache, cacheDuration, context) {
  // we need to return a different throttled function for each different parameters so memoize it
  var memoizedFunction = _.memoize(function() {
    var myFuncToCacheArguments = arguments;
    var throttledFunc = _.throttle(myFuncToCache, cacheDuration, {trailing: false});
    return function executeThrottledFunction() {return throttledFunc.apply(null, myFuncToCacheArguments);};
  });

  return function applyMemoizedFunction() {
    // apply the throttled function
    return memoizedFunction.apply(context, arguments)();
  };
}

module.exports = {
  logResult: logResult,
  logError: logError,
  setTimeoutPromised: setTimeoutPromised,
  cacheFunction: cacheFunction
};