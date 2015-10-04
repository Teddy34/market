var sdeConnector = require('./io/sdeConnector');
var sdeController = require('./app/sdeController');
var _ = require('lodash');

var tools = require('./tools');
var market = require('./app/marketAnalyser');

var extractIdList = function(list) {
	return _.pluck(list, 'typeID');
}

var getMultipleStocksAtReasonablePrice = function(itemIdList) {
	return market.getMultipleStocksAtReasonablePrice(itemIdList, 'Fliet', 1.15)
}

var getDataForItems = function() {
	return sdeController.getItemIdByName('1MN Afterburner II').then(extractIdList).then(getMultipleStocksAtReasonablePrice)
}


sdeConnector.connect().then(getDataForItems).then(tools.logResult,tools.logError);