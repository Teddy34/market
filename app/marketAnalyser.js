var _ = require('lodash');

var marketData = require('./marketData');


//Math Utilities

function roundXDigits(number, digits) {
  var rounder = Math.pow(10,digits);
  return Math.round(rounder*number)/rounder;
}

function doStatAnalysis(array) {
  if (!array || !array.length) {
    if (array.length === 0) {
      return {mean:0, stDeviation: 0, relStdDeviation: 0};
      }
    else {
      throw new Error("empty list for doStatAnalysis");
    }
  }     


  var mean = array.reduce(function(a, b){return a+b;})/array.length;
  var dev= array.map(function(itm){return (itm-mean)*(itm-mean);});
  var stDeviation = Math.sqrt(dev.reduce(function(a, b){return a+b;})/array.length);
  var relStdDeviation =stDeviation/mean;
  return {mean: roundXDigits(mean,2), stDeviation: roundXDigits(stDeviation,2), relStdDeviation: roundXDigits(relStdDeviation,4)};
}

// decorators;

var decorateOrders = function(orders) {
  return _(orders).map(function(order) {return {price: order.price, volume: order.volume};}).sortBy('price').value();
};

// primitives

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
    return roundXDigits(nReasonable * results[1].mean,2);
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

// using another way to get reference
var summariesParser = function(summaries) {
  return _.map(summaries, function(summary){
    return {
      mean: summary.all.avg,
      weightedMean: summary.all.wavg,
      minSell: summary.sell.min,
      buyMax: summary.buy.max
    };
  });
};

var getPriceReferenceFromSummary = function(itemId) {
  return marketData.fetchMarketSummaryByTypeAndSystemName(itemId, 'Dodixie')
  .then(summariesParser);
};

var getReferencePriceListAndSellOrderList = function(typeIdList, systemName) {
  var priceRefenceList = getPriceReferenceFromSummary(typeIdList);
  var systemSellOrders = marketData.fetchMarketSellByTypeAndSystemName(itemId, systemName);

  return Promise.all(priceRefenceList,systemSellOrders);
};



// exposed primitives
getMultipleStocksAtReasonablePrice = function(typeIdList, systemName, reasonablePrice) {

  var partial = function(typeId) {
    return getStockAtReasonablePrice(typeId, systemName, reasonablePrice);
  };

  return Promise.all(_.map(typeIdList,partial));
};

module.exports = {
  getMultipleStocksAtReasonablePrice: getMultipleStocksAtReasonablePrice,
  getPriceReferenceFromSummary: getPriceReferenceFromSummary
};