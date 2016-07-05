var _ = require('lodash');
var moment = require('moment');

var template = require('./appTemplate');
var marketAnalyser = require('./marketAnalyser');
var primalistConnector = require('../io/primalistConnector');
var tools = require('../tools');
var parameters = require('../parameters');
var storageConnector = require('../io/storageConnector');
var sdeConnector = require('../io/sdeConnector');

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
		return marketAnalyser.getAnalysedItemListBySystemName(typeIdList, parameters.targetSystem);
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

var storeData = function(results) {
	var now = Date.now();
	console.log("Data updated at", now);
	storedData.all = {
		data: _.sortBy(results, function(item) {return 100000*(0-item.volume)+item.groupID;}),
		timestamp: now
	};
	return storedData;
};

var saveData = function(storedData) {
	storageConnector.save(storedData.all);
	return storedData;
};

var handleResults = function(results) {
	console.log("Update succeeded");
	return Promise.resolve(results)
	.then(storeData)
	.then(function(storedData) {return parameters.useExternalStorage ?  Promise.resolve(results).then(useExternalStorage) : storedData;});
};

var updateData = function() {
	Promise.resolve()
	.then(sdeConnector.connect)
	.then(getAllTypesLimited)
	.then(handleResults)
	.catch(tools.logError)
	.then(sdeConnector.disconnect,sdeConnector.disconnect);
};

var getLastData = function() {

	if (parameters.useExternalStorage) {
	  return Promise.resolve()
	  .then(function() {return storageConnector.getLast();})
	  .catch(tools.logError)
	  .catch(function() {return storedData.all;});
	}
	return Promise.resolve(storedData.all);

};

setInterval(updateData,parameters.appUpdateInterval);
updateData();

// templating

var getRenderedTemplate = function(result) {
	var time = moment(result.timestamp).format('MMMM Do YYYY, h:mm:ss a');
	return template({items:result.data, appUrl:parameters.appUrl, timestamp:time});
};

// exposed primitives to get results

var serveAPI = function () {
	return getLastData();
};

var serveHTML = function () {
	return Promise.resolve()
	.then(getLastData)
	//.then(function(result) {return result.data;})
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