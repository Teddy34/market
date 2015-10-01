// agregate data from different data source controllers and provide primitives to get data without reference to the source.

var _ = require('lodash');

var crest = require('./crestController');
var sde = require('./sdeController');

var getStationIDList = function(systemList) {
  return _.pluck(list, 'stationID');
};

var filterBySystem = function(results) {
  var marketOrders = results[0];
  var stationIDList = results[1];

  var predicate = function(order) {
    return (stationIDList.indexOf(order.location.id_str) !== -1 );
  };

  return _.filter(marketOrders.items, predicate);
};

var fetchMarketSellByTypeAndSystemName = function(typeId, systemName) {

  var getMarketSellOrders = function(systemDataList) {
    return Promise.all([crest.fetchMarketSellByRegionIdAndType(systemDataList[0].regionID, typeId),
                        getStationIDList(systemDataList)])
    .then(filterBySystem);
  };

  return sde.getLocationsFromSystemName(systemName)
  .then(getMarketSellOrders);
};

module.exports = {
  fetchMarketSellByTypeAndSystemName: fetchMarketSellByTypeAndSystemName
};