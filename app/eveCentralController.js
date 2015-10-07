var _ = require('lodash');

var eveCentralConnector = require('../io/eveCentralConnector');
var tools = require('../tools');
var parameters = require('../parameters');

var fetchMarketSummaryByTypeAndSystemName = function(data) {
  if (!data.typeId) {
    throw new Error("missing typeId");
  }

  if (!data.systemId) {
    throw new Error("missing typeId");
  }
  
  return eveCentralConnector.fetch(data);
};

var hashArgument = function(data) {
  return "" + data.typeId + data.systemId;
};

module.exports = {
  fetchMarketSummaryByTypeAndSystemName: tools.cacheFunction(fetchMarketSummaryByTypeAndSystemName, parameters.eveCentralCacheDuration, hashArgument)
};