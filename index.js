var parameters = require('./');
var sdeConnector = require('./io/sdeConnector');

var marketAnalyser = require('./app/marketAnalyser');

sdeConnector.connect();

// log utilities
function logger(input) {
  console.log(input);
  return input;
}

function logError(error) {
  console.error("Error:",error);
}

//getPriceReference(448)
//predicate()
//fetchMarketSellByTypeAndSystemName(608, 'Dodixie')
//getStockAtReasonablePrice(448, 'Fliet', 1.15)
marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
.then(logger)
.catch(logError);

/*fetchMarketSellByRegionAndType('Essence', 448)
.then(logCount)
.catch(logError);*/