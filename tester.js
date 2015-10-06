// tester to get a combinaison of throttle and memoize.

var _ = require('lodash');

var start = Date.now();

var func = function(text) {
  var toDisplay = "argument " + text + " at " + (Date.now() - start);
  console.log("executed with", toDisplay);
  return toDisplay;
};

var getCachedFunc = function(myFuncToCache, cacheDuration, context) {
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
};

var myCachedFunc = getCachedFunc(func, 4000);

var callWithArgument1 = function() {
  console.log("calling with argument 1 at " + (Date.now() - start));
  console.log("returned",myCachedFunc('1'));
};

var callWithArgument2 = function() {
  console.log("calling with argument 2 at " + (Date.now() - start));
  console.log("returned",myCachedFunc('2'));
};

callWithArgument1();
setTimeout(function() {callWithArgument1();}, 2000);
setTimeout(function() {callWithArgument2();}, 2200);
setTimeout(function() {callWithArgument1();}, 5000);