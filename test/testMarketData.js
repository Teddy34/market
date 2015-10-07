var marketData = require('../app/marketData');
var tools = require('../tools');
var sdeConnector = require('../io/sdeConnector');

var makeTest = function() {
  return marketData.fetchMarketSummaryByTypeAndSystemName(34, 'Jita').then(tools.logResult)
  .catch(function(err) {console.log(err);});
};

sdeConnector.connect()
.then(makeTest);
