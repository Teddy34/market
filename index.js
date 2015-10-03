var parameters = require('./');

var tools = require('./tools');
var sdeConnector = require('./io/sdeConnector');
var marketAnalyser = require('./app/marketAnalyser');

sdeConnector.connect();

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

function connectDB() {
  console.info("Database connecting");
  return sdeConnector.connect();
}

function startWebServer() {
  console.info("WebServer starting" );
  var test = require('./server/server');
  return require('./server/server').start(process.env.PORT || 8080);
}

function logServiceStarting(result) {
  console.info("Service starting");
  return result;
}

function logDBStarting(result) {
  console.info("Database starting");
  return result;
}

function logWebServerStarted(result) {
  console.info("WebServer started");
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
  .then(connectDB)
  .then(logDBStarting)
  .then(startWebServer)
  .then(logWebServerStarted)
  .catch(logError);

