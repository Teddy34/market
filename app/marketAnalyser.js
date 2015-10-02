var _ = require('lodash');

var marketData = require('./marketData');

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

  return marketData.fetchMarketSellByTypeAndSystemName(itemId, 'Dodixie')
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

    var systemSellOrders = marketData.fetchMarketSellByTypeAndSystemName(itemId, systemName);
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

module.exports = {
  getMultipleStocksAtReasonablePrice: getMultipleStocksAtReasonablePrice
};