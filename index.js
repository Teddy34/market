var _ = require('lodash');
var crestConnector = require('./io/crestConnector');

var crestEntryPointUrl = "https://public-crest.eveonline.com/";

// log utilities
function logger(input) {
  console.log(input);
  return input;
}

function logError(error) {
  console.error("Error:",error);
}

function logCount(result) {
  console.log("returned: ",result.items.length);
  return result;
}
function logFirst(result) {
  console.log(result.items[0]);
  return result;
}

var eveSDE = require('./io/eveSDE');
eveSDE. connect(process.env.DB_CONNECTION_STRING || require('./databaseCredentials');

var getStationIDList = function(systemData) {return Promise.resolve(systemData).then(function(list) {return _.pluck(list, 'stationID');});};


var filterBySystem = function(results) {
  var marketOrders = results[0];
  var stationIDList = results[1];

  var predicate = function(order) {
    return (stationIDList.indexOf(order.location.id_str) !== -1 );
  };

  return _.filter(marketOrders.items, predicate);
};

/*Promise.all([fetchMarketSellByRegionIdAndType('10000064', 448), eveSDE.getLocationsFromSystemName('Fliet').then(getStationIDList)])
.then(filterBySystem)
.then(logger)
.catch(logError);*/

var fetchMarketSellByTypeAndSystemName = function(typeId, systemName) {

  var getMarketSellOrders = function(systemData) {
    getStationIDList(systemData);
    return Promise.all([fetchMarketSellByRegionIdAndType(systemData[0].regionID, typeId), getStationIDList(systemData)])
    .then(filterBySystem);
  };

  return eveSDE.getLocationsFromSystemName(systemName)
  .then(getMarketSellOrders);
};

var decorateOrders = function(orders) {
  return _(orders).map(function(order) {return {price: order.price, volume: order.volume};}).sortBy('price').value();
};

//eveSDE.getLocationsFromSystemName('Fliet')
/*fetchMarketSellByTypeAndSystemName(448, 'Dodixie')
.then(decorateOrders)*/

var getAverageCheapestPrice = function(orderList, number) {
  return _.chain(orderList).take(Math.min(orderList.length, number)).pluck('price').thru(doStatAnalysis).value();
};

var getAverageCheapestPricePartial = function(number) {
  return function(orderList) {
    return getAverageCheapestPrice(orderList, number);
  };
};

var getPriceReference = function(itemId) {

  function decorate(analysedPrice) {
    analysedPrice.itemId = itemId;
    return analysedPrice;
  }

  return fetchMarketSellByTypeAndSystemName(itemId, 'Dodixie')
  .then(decorateOrders)
  .then(getAverageCheapestPricePartial(3))
  .then(decorate);
};

var filterOrdersByPriceTreshold = function(orderList, treshold) {
  var predicate = function(order) {
    return (order.price <= treshold);
  };
  return _.filter(orderList, predicate);
};

var getStockAtReasonablePrice = function(itemId, systemName, nReasonable) {

  var fetchData = function() {

    var systemSellOrders = fetchMarketSellByTypeAndSystemName(itemId, systemName);
    var priceReference = getPriceReference(itemId);

    return Promise.all([systemSellOrders, priceReference]);
  };

  var getReasonablePrice = function(results) {
    return nReasonable * results[1].mean;
  };

  var filterPartial = function(results) {
    return filterOrdersByPriceTreshold(results[0], getReasonablePrice(results));
  };

  var mergeData = function(results) {
    var volumeAvailable = _(results).thru(filterPartial).reduce(reduceVolume, 0);
    return {
      itemId: itemId,
      systemName: systemName,
      hubData : results[1],
      reasonablePrice: getReasonablePrice(results),
      volumeAvailable: volumeAvailable
    };
  };

  return Promise.resolve()
    .then(fetchData)
    .then(mergeData);
};

var reduceVolume = function(memo, order) {
  return memo += order.volume;
};

getMultipleStocksAtReasonablePrice = function(typeIdList, systemName, reasonablePrice) {

  var partial = function(typeId) {
    return getStockAtReasonablePrice(typeId, systemName, reasonablePrice);
  };

  return Promise.all(_.map(typeIdList,partial));
};

//getPriceReference(448)
//predicate()
//fetchMarketSellByTypeAndSystemName(608, 'Dodixie')
//getStockAtReasonablePrice(448, 'Fliet', 1.15)
getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
.then(logger)
.catch(logError);

/*fetchMarketSellByRegionAndType('Essence', 448)
.then(logCount)
.then(logFirst)
.catch(logError);*/