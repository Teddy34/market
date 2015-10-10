var _ = require('lodash');

var marketData = require('./marketData');
var tools = require('../tools');
var parameters = require('../parameters');


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

var decorateSellOrder = function(order) {
  return {
    minPrice: order.price,
    volume: order.volume
  };
}

var decorateOrdersAndOrderByPrice = function(orders) {
  return _(orders).map(decorateSellOrder).sortBy('price').value();
};

var mergeThreeLists = function (lists) {
  var idList = _.map(lists[2], function(id) {return {typeId:id};});
  var orderListInObject = _.map(lists[1], function(orderList) {return {orders:orderList};});
  // ideally we would want to have a merger of any number of list
  return _(lists[0]).zip(orderListInObject,idList).map(tools.mergeToOneObject).value();
};

var finalDecorator = function(itemList) {
  return _.map(itemList, function(item) {return _.omit(item, ["orders", "price"]);});
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
  .then(decorateOrdersAndOrderByPrice)
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

var decoratorMethodTwo = function(item) {
  item.price = item.minSell; // a strategy of determining price
  item.mean = roundXDigits(item.mean,2);
  item.weightedMean = roundXDigits(item.weightedMean,2);
  return item;
};

var getReferencePriceListAndSellOrderList = function(typeIdList, systemName) {

  var getMultipleSellOrders = function(itemId) {
    return marketData.fetchMarketSellByTypeAndSystemName(itemId, systemName)
    //.then(function(orderList) {return _.map(orderList,decorateSellOrder);});
  };

  var priceRefenceList = getPriceReferenceFromSummary(typeIdList);
  var systemSellOrders = Promise.all(_.map(typeIdList, getMultipleSellOrders));

  return Promise.all([priceRefenceList, systemSellOrders, typeIdList])
  .then(mergeThreeLists)
  .then(function(itemList){return _.map(itemList,decoratorMethodTwo)});
};

var reduceSoldVolumeUnderTresholdPrice = function(item) {
  var maxPrice = parameters.priceTresholdMultiplier*item.price;
  item.volumeAvailable = _.reduce(filterOrdersByPriceTreshold(item.orders , parameters.priceTresholdMultiplier*item.price),reduceVolume,0);
  
  return item;
};

var getAnalysedItemListBySystemName = function(typeIdList, systemName) {
  return getReferencePriceListAndSellOrderList(typeIdList,systemName)
  .then(function(itemList) {return _.map(itemList,reduceSoldVolumeUnderTresholdPrice);})
  .then(finalDecorator);
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
  getPriceReferenceFromSummary: getPriceReferenceFromSummary,
  getReferencePriceListAndSellOrderList: getReferencePriceListAndSellOrderList,
  getAnalysedItemListBySystemName: getAnalysedItemListBySystemName
};