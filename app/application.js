'use strict';

const _ = require('lodash');
const moment = require('moment');

const template = require('./appTemplate');
const marketAnalyser = require('./marketAnalyser');
const primalistConnector = require('../io/primalistConnector');
const tools = require('../tools');
const parameters = require('../parameters');
const storageConnector = require('../io/storageConnector');
const sdeConnector = require('../io/sdeConnector');

function filterList(itemList) {
	return _.filter(itemList, function(item) {
		console.log(item.typeID, item.typeName, item.groupID, parameters.filteredItemList.indexOf(""+ item.typeID));
		return (parameters.filteredItemList.indexOf(""+ item.typeID) === -1);
	});
}

// stored result from different calls
let storedData;

function logCount(list) {
	console.log(list.length, 'items');
	return list;
}

const getItemIdList = function(itemList) {
	return _.map(itemList, 'typeID');
};

const parseData = function(itemList) {
	console.log('Analysing:',itemList.length, 'items');
	const analyseMarket = function(typeIdList) {
		return marketAnalyser.getAnalysedItemListBySystemName(typeIdList, parameters.targetSystem);
	};

	const splitData = function(itemList) {
		var marketPromise = Promise.resolve(itemList).then(getItemIdList).then(analyseMarket);
		return Promise.all([itemList, marketPromise]);
	};

	const mergeData = function(resultList) {
		return _(resultList[0]).zip(resultList[1]).map(tools.mergeToOneObject).value();
	};

	return Promise.resolve(itemList).then(splitData).then(mergeData);
};

// different dashboards

const getAllTypesLimited = function() {
	const take = function(itemList) {
		return _.take(itemList,parameters.limiter);
	};

	return primalistConnector.fetch().then(filterList).then(take).then(parseData);
};

const storeData = function(results) {
	const now = Date.now();
	console.log("Data updated at", now);
	storedData = {
		data: _.sortBy(results, function(item) {return 100000*(0-item.volume)+item.groupID;}),
		timestamp: now
	};
	return storedData;
};

const useExternalStorage = function(storedData) {
	storageConnector.save(storedData);
	return storedData;
};

const handleResults = function(results) {
	console.log("Update succeeded");
	return Promise.resolve(results)
	.then(storeData)
	.then(function(storedData) {return parameters.useExternalStorage ?  Promise.resolve(storedData).then(useExternalStorage) : storedData;});
};

const updateData = function() {
	Promise.resolve()
	.then(sdeConnector.connect)
	.then(getAllTypesLimited)
	.then(handleResults)
	.catch(tools.logError)
	.then(sdeConnector.disconnect,sdeConnector.disconnect);
};

const getLastData = function() {

	if (parameters.useExternalStorage) {
	  return Promise.resolve()
	  .then(() => storageConnector.getLast())
	  .catch(tools.logError)
	  .catch(() => storedData);
	}
	return Promise.resolve(storedData);

};

setInterval(updateData,parameters.appUpdateInterval);
updateData();

// templating

const getRenderedTemplate = function(result) {
	var time = moment(result.timestamp).format('MMMM Do YYYY, h:mm:ss a');
	return template({items:result.data, appUrl:parameters.appUrl, timestamp:time});
};

// exposed primitives to get results

const serveAPI = function () {
	return getLastData();
};

const serveHTML = function () {
	return Promise.resolve()
	.then(getLastData)
	//.then(function(result) {return result.data;})
	.then(getRenderedTemplate)
	.catch(function() {return "no data available";});
};

module.exports = {
	serveAPI: serveAPI,
	serveHTML: serveHTML
};