var marketAnalyser = require('../app/marketAnalyser');
var tools = require('../tools');
var sdeConnector = require('../io/sdeConnector');

var makeTest = function() {
  console.log("make test");
  return marketAnalyser.getPriceReferenceFromSummary(34).then(tools.logResult)
  .catch(function(err) {console.log(err);});
};

sdeConnector.connect()
.then(makeTest)
.catch(function(err) {console.log("main:",err);});
