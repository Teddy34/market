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

function cacheFunction(myFuncToCache, cacheDuration, hashFunction, context) {
  // we need to return a different throttled function for each different parameters so memoize it
  var memoizedFunction = _.memoize(function() {
    var myFuncToCacheArguments = arguments;
    var throttledFunc = _.throttle(myFuncToCache, cacheDuration, {trailing: false});
    return function executeThrottledFunction() {return throttledFunc.apply(null, myFuncToCacheArguments);};
  }, hashFunction);

  return function applyMemoizedFunction() {
    // apply the throttled function
    return memoizedFunction.apply(context, arguments)();
  };
}

function promisedThrottle(func, duration) {
  // pool management
  var pool = [];

  var removeFromPool = function() {
    if (pool.length) {
      pool.shift()();
    }
  };

  var addToPool = function(input) {
    var promise = new Promise(function(resolve, reject) {
        pool.push(function(){resolve(input);});
    });
    //return the result of the call;
    return promise.then(func);
  };

  setInterval(removeFromPool, duration);
  return addToPool;
}

function mergeToOneObject(list) {
  console.log("mergeToOneObject", list);
 return _.reduce(list, function(memo,value) {return _.extend(memo,value);});
};

module.exports = {
  logResult: logResult,
  logError: logError,
  setTimeoutPromised: setTimeoutPromised,
  cacheFunction: cacheFunction,
  promisedThrottle: promisedThrottle,
  mergeToOneObject: mergeToOneObject
};