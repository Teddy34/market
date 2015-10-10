var marketAnalyser = require('../app/marketAnalyser');
var tools = require('../tools');
var sdeConnector = require('../io/sdeConnector');

var makeTest = function() {
  console.log("make test");
  //return marketAnalyser.getPriceReferenceFromSummary([34,35]).then(tools.logResult)
  //return marketAnalyser.getReferencePriceListAndSellOrderList([448], 'Fliet').then(tools.logResult)
  return marketAnalyser.getAnalysedItemListBySystemName([448], 'Fliet').then(tools.logResult)
  .catch(function(err) {console.log(err.stack);});
};

sdeConnector.connect()
.then(makeTest)
.catch(function(err) {console.log("main:",err.stack);});
