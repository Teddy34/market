var _ = require('lodash');

var template = require('./appTemplate');
var marketAnalyser = require('./marketAnalyser');
var primalistConnector = require('../io/primalistConnector');
var tools = require('../tools');
var limiter = require('../parameters').limiter;

var mergeToOneObject = function(list) {
 return _.reduce(list, function(memo,value) {return _.extend(memo,value);});
};

var getData = function() {
	var getItemIdList = function(itemList) {
		return _.pluck(itemList, 'typeID');
	};

	var takeTen = function(itemList) {
		return _.take(itemList,limiter);
	}

	var analyseMarket = function(typeIdList) {
		return marketAnalyser.getMultipleStocksAtReasonablePrice(typeIdList, 'Fliet', 1.15)
	};

	var splitData = function(itemList) {
		var marketPromise = Promise.resolve(itemList).then(getItemIdList).then(analyseMarket)
		return Promise.all([itemList, marketPromise]);
	};

	var mergeData = function(resultList) {
		return _(resultList[0]).zip(resultList[1]).map(mergeToOneObject).value();
	}

	return primalistConnector.fetch().then(takeTen).then(splitData).then(mergeData)
}

var getRenderedTemplate = function(data) {
  return template({items:data});
};

var serveSample = function () {
	return marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
	.catch(tools.logError);
};

var serveAPI = function () {
	return getData()
		.catch(tools.logError);
};

var serveHTML = function () {
	return getData()
	  .then(getRenderedTemplate)
	  .catch(tools.logError);
};


module.exports = {
	serveSample: serveSample,
	serveAPI: serveAPI,
	serveHTML: serveHTML
};