var _ = require('lodash');

var marketData = require('./marketData');
var tools = require('../tools');
var parameters = require('../parameters');


//Math Utilities

function roundXDigits(number, digits) {
  var rounder = Math.pow(10,digits);
  return Math.round(rounder*number)/rounder;
}

// decorators;
var mergeThreeLists = function (lists) {
  var idList = _.map(lists[2], function(id) {return {typeId:id};});
  var orderListInObject = _.map(lists[1], function(orderList) {return {orders:orderList};});
  // ideally we would want to have a merger of any number of list
  return _(lists[0]).zip(orderListInObject,idList).map(tools.mergeToOneObject).value();
};

var finalDecorator = function(itemList) {
  return _(itemList).map(function(item) {
    item.reasonablePrice = roundXDigits(item.price * parameters.priceRecommandedMultiplier,2);
    item.hubData = {mean:item.price};
    return item;
  })
  .map(function(item) {return _.omit(item, ["orders", "price"]);}).value();
};

var filterOrdersByPriceTreshold = function(orderList, treshold) {
  var predicate = function(order) {
    return (order.price <= treshold);
  };
  return _.filter(orderList, predicate);
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
  return marketData.fetchMarketSummaryByTypeAndSystemName(itemId, parameters.referenceSystemHub)
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

module.exports = {
  getPriceReferenceFromSummary: getPriceReferenceFromSummary,
  getReferencePriceListAndSellOrderList: getReferencePriceListAndSellOrderList,
  getAnalysedItemListBySystemName: getAnalysedItemListBySystemName
};