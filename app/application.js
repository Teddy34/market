var _ = require('lodash');

var template = require('./appTemplate');
var marketAnalyser = require('./marketAnalyser');
var primalistConnector = require('../io/primalistConnector');
var tools = require('../tools');
var limiter = require('../parameters').limiter;

function logCount(list) {
	console.log(list.length, 'items');
	return list;
}

var mergeToOneObject = function(list) {
 return _.reduce(list, function(memo,value) {return _.extend(memo,value);});
};

var getItemIdList = function(itemList) {
	return _.pluck(itemList, 'typeID');
};

var parseData = function(itemList) {
	var analyseMarket = function(typeIdList) {
		return marketAnalyser.getMultipleStocksAtReasonablePrice(typeIdList, 'Fliet', 1.15)
	};

	var splitData = function(itemList) {
		var marketPromise = Promise.resolve(itemList).then(getItemIdList).then(analyseMarket)
		return Promise.all([itemList, marketPromise]);
	};

	var mergeData = function(resultList) {
		return _(resultList[0]).zip(resultList[1]).map(mergeToOneObject).value();
	};

	return Promise.resolve(itemList).then(splitData).then(mergeData);
};

// different dashboards

var getAllTypesLimited = function() {
	var take = function(itemList) {
		return _.take(itemList,limiter);
	};

	return primalistConnector.fetch().then(take).then(parseData);
};

var getShips = function() {
	var filterShips = function(itemList) {
		return _.filter(itemList, function(item) {return item.volume > 1000});
	};
	return primalistConnector.fetch().then(filterShips).then(parseData);
};

var getSmallItems = function() {
	var filterSmallItems = function(itemList) {
		return _.filter(itemList, function(item) {return item.volume >= 1 && item.volume <=50});
	};
	return primalistConnector.fetch().then(filterSmallItems).then(logCount).then(parseData);
};

// templating

var getRenderedTemplate = function(data) {
	return template({items:data});
};

// exposed primitives to get results

var serveSample = function () {
	return marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
	.catch(tools.logError);
};

var serveAPI = function () {
	return getAllTypesLimited()
	.catch(tools.logError);
};

var serveHTML = function () {
	return getAllTypesLimited()
	.then(getRenderedTemplate)
	.catch(tools.logError);
};

var serveShipsHTML = function() {
	return getShips()
	.then(getRenderedTemplate)
	.catch(tools.logError);
};

var serveSmallItemsHTML = function() {
	return getSmallItems()
	.then(getRenderedTemplate)
	.catch(tools.logError);
};

module.exports = {
	serveSample: serveSample,
	serveAPI: serveAPI,
	serveHTML: serveHTML,
	serveShipsHTML: serveShipsHTML,
	serveSmallItemsHTML: serveSmallItemsHTML
};