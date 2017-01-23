// agregate data from different data source controllers and provide primitives to get data without reference to the source.

var _ = require('lodash');

var crest = require('./crestController');
var sde = require('./sdeController');
var eveCentral = require('./eveCentralController');

var getStationIDList = function(systemList) {
  return _(systemList).map('facilityID').map(String);
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
  if (!typeId || !systemName) {
    throw new Error("fetchMarketSellByTypeAndSystemName invalid input typeId:", typeId, " systemName:", systemName);
  }

  var getMarketSellOrders = function(systemDataList) {
    return Promise.all([crest.fetchMarketSellByRegionIdAndType('10000051', typeId),
                        systemDataList])
    .then(filterBySystem);
  };

  function checkLocationListNotEmpty(locationList) {
    console.log(locationList);
    if (!locationList || !locationList.length) {
      throw new Error('No station or outpost in ',systemName);
    }
    return locationList;
  }


  return Promise.resolve(['60014922'])
  .then(getMarketSellOrders);
};

//accept also arrays
var fetchMarketSummaryByTypeAndSystemName = function(typeId, systemName) {
  var decoratePartial = function(systemId) {
    return {typeId:typeId, systemId:systemId};
  };

  return Promise.resolve(systemName)
  .then(sde.getSystemIDFromSystemName)
  .then(decoratePartial)
  .then(eveCentral.fetchMarketSummaryByTypeAndSystemName);
};

module.exports = {
  fetchMarketSellByTypeAndSystemName: fetchMarketSellByTypeAndSystemName,
  fetchMarketSummaryByTypeAndSystemName: fetchMarketSummaryByTypeAndSystemName
};