var _ = require('lodash');
var crestConnector = require('./io/crestConnector');

var crestEntryPointUrl = "https://public-crest.eveonline.com/";

// log utilities
function logger(input) {
  console.log(input);
  return input;
}

function logError(error) {
  console.error("Error:",error);
}

function logCount(result) {
  console.log("returned: ",result.items.length);
  return result;
}
function logFirst(result) {
  console.log(result.items[0]);
  return result;
}

//getPriceReference(448)
//predicate()
//fetchMarketSellByTypeAndSystemName(608, 'Dodixie')
//getStockAtReasonablePrice(448, 'Fliet', 1.15)
getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
.then(logger)
.catch(logError);

/*fetchMarketSellByRegionAndType('Essence', 448)
.then(logCount)
.then(logFirst)
.catch(logError);*/