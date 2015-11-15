var _ = require('lodash');

var template = require('./appTemplate');
var marketAnalyser = require('./marketAnalyser');
var primalistConnector = require('../io/primalistConnector');
var tools = require('../tools');
var parameters = require('../parameters');
var storageConnector = require('../io/storageConnector');

function filterList(itemList) {
	return _.filter(itemList, function(item) {
		return (parameters.filteredItemList.indexOf(""+ item.typeID) === -1);
	});
}

// stored result from different calls
var storedData = {
	all: null,
	small: null,
	ships: null
};

function logCount(list) {
	console.log(list.length, 'items');
	return list;
}

var getItemIdList = function(itemList) {
	return _.pluck(itemList, 'typeID');
};

var parseData = function(itemList) {
	console.log('Analysing:',itemList.length, 'items');
	var analyseMarket = function(typeIdList) {
		return marketAnalyser.getAnalysedItemListBySystemName(typeIdList, 'Fliet');
	};

	var splitData = function(itemList) {
		var marketPromise = Promise.resolve(itemList).then(getItemIdList).then(analyseMarket);
		return Promise.all([itemList, marketPromise]);
	};

	var mergeData = function(resultList) {
		return _(resultList[0]).zip(resultList[1]).map(tools.mergeToOneObject).value();
	};

	return Promise.resolve(itemList).then(splitData).then(mergeData);
};

// different dashboards

var getAllTypesLimited = function() {
	var take = function(itemList) {
		return _.take(itemList,parameters.limiter);
	};

	return primalistConnector.fetch().then(filterList).then(take).then(parseData);
};

var getShips = function() {
	var filterShips = function(itemList) {
		return _.filter(itemList, function(item) {return item.volume > parameters.minBigItemSize;});
	};
	return primalistConnector.fetch().then(filterShips).then(parseData);
};

var getSmallItems = function() {
	var filterSmallItems = function(itemList) {
		return _.filter(itemList, function(item) {return item.volume <= parameters.maxSmallItemSize;});
	};
	return primalistConnector.fetch().then(filterSmallItems).then(logCount).then(parseData);
};

storeData = function(results) {
	var now = Date.now();
	console.log("Data updated at", now);
	storedData.all = {
		data: _.sortBy(results, function(item) {return 100000*(0-item.volume)+item.groupID;}),
		timestamp: now
	};
	storageConnector.save(storedData.all);
};

var updateData = function() {
	getAllTypesLimited()
	.then(storeData)
	.catch(tools.logError);
};

var getLastData = function() {
	return Promise.resolve()
	.then(function() {return storageConnector.getLast();})
	.catch(tools.logError)
	.catch(function() {return storedData.all;});
}

setInterval(updateData,parameters.appUpdateInterval);
updateData();

// templating

var getRenderedTemplate = function(data) {
	return template({items:data, appUrl:parameters.appUrl});
};

// exposed primitives to get results

var serveAPI = function () {
	return getLastData();
};

var serveHTML = function () {
	return Promise.resolve()
	.then(getLastData)
	.then(function(result) {return result.data;})
	.then(getRenderedTemplate)
	.catch(function() {return "no data available";});
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
	serveAPI: serveAPI,
	serveHTML: serveHTML,
	serveShipsHTML: serveShipsHTML,
	serveSmallItemsHTML: serveSmallItemsHTML
};