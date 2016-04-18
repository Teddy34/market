var marketData = require('../app/marketData');
var tools = require('../tools');
var sdeConnector = require('../io/sdeConnector');

var makeSummaryTest = function() {
  return marketData.fetchMarketSummaryByTypeAndSystemName(34, 'Jita').then(tools.logResult)
  .catch(function(err) {console.log(err);});
};

var fetchMarketSellByTypeAndSystemName = function() {
  return marketData.fetchMarketSellByTypeAndSystemName(594, 'I1Y-IU').then(tools.logResult)
  .catch(function(err) {console.log(err);});
}

sdeConnector.connect()
//.then(makeSummaryTest);
.then(fetchMarketSellByTypeAndSystemName);
