var parameters = require('./');

var tools = require('./tools');
var sdeConnector = require('./io/sdeConnector');
var marketAnalyser = require('./app/marketAnalyser');

sdeConnector.connect();

//getPriceReference(448)
//predicate()
//fetchMarketSellByTypeAndSystemName(608, 'Dodixie')
//getStockAtReasonablePrice(448, 'Fliet', 1.15)
marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
.then(tools.logResult)
.catch(tools.logError);

/*fetchMarketSellByRegionAndType('Essence', 448)
.then(logCount)
.catch(logError);*/