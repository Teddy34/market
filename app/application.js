var _ = require('lodash');

var template = require('./appTemplate');
var marketAnalyser = require('./marketAnalyser');
var primalistConnector = require('../io/primalistConnector');
var tools = require('../tools');

var mergeToOneObject = function(list) {
 return _.reduce(list, function(memo,value) {return _.extend(memo,value);});
};

var serveSample = function () {
	return ;
	return marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
	.catch(tools.logError);
};

var serveAPI = function () {

	var getItemIdList = function(itemList) {
		return _.pluck(itemList, 'typeID');
	};

	var takeTen = function(itemList) {
		return _.take(itemList,5);
	}

	var analyseMarket = function(typeIdList) {
		return marketAnalyser.getMultipleStocksAtReasonablePrice(typeIdList, 'Fliet', 1.15)
	};

	var regroupData = function(itemList) {
		return Promise.all([itemList, analyseMarket(itemList)]);
	};

	var mergeData = function(resultList) {
		return _(resultList[0]).zip(resultList[1]).map(mergeToOneObject).value();
	}

	return primalistConnector.fetch().then(getItemIdList).then(takeTen).then(regroupData)//.then(mergeData)
	.catch(tools.logError);
	/*return marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
	.catch(tools.logError);*/
};


module.exports = {
	serveSample: serveSample,
	serveAPI: serveAPI
};