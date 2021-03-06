var parameters = require('./parameters');

var tools = require('./tools');
var sdeConnector = require('./io/sdeConnector');
var marketAnalyser = require('./app/marketAnalyser');
var storageConnector = require('./io/storageConnector');

//getPriceReference(448)
//predicate()
//fetchMarketSellByTypeAndSystemName(608, 'Dodixie')
//getStockAtReasonablePrice(448, 'Fliet', 1.15)
/*marketAnalyser.getMultipleStocksAtReasonablePrice([448, 3017, 2048, 4025], 'Fliet', 1.15)
.then(tools.logResult)
.catch(tools.logError);*/

/*fetchMarketSellByRegionAndType('Essence', 448)
.then(logCount)
.catch(logError);*/

function initSDE() {
  console.info("SDE starting");
  return sdeConnector.setConnectionString(parameters.sdeConnectionString);
}

function startWebServer() {
  console.info("WebServer starting" );
  var test = require('./server/server');
  return require('./server/server').start(process.env.PORT || 8082);
}

function initStorage() {
  console.info("Storage starting" );
  return storageConnector.setConnectionString(parameters.storageConnectionString);
}

function logServiceStarting(result) {
  console.info("Service started");
  return result;
}

function logSDEStarted(result) {
  console.info("SDE started");
  return result;
}

function logWebServerStarted(result) {
  console.info("WebServer started");
  return result;
}

function logStorageStarted(result) {
  console.info("Storage started");
  return result;
}

function logError(error) {
  console.error("Error while starting the service:", error);
  if (error & error.stack) {
    console.error(error.stack);
  }
  return Promise.reject(error); // forward the error  to be able to crash
}

// startup workflow
Promise.resolve()
  .then(logServiceStarting)
  .then(initSDE)
  .then(logSDEStarted)
  .then(initStorage)
  .then(logStorageStarted)
  .then(startWebServer)
  .then(logWebServerStarted)
  .catch(logError);

