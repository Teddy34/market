var express = require('express');
var _ = require('lodash');
var cors = require('cors');

var application = require('../app/application');
var THROTTLE_DURATION = 5 * 60 * 1000;

var webServer;

var serveAPI = application.serveAPI,THROTTLE_DURATION;
var serveHTML = application.serveHTML,THROTTLE_DURATION;

var getHTMLMiddleware = function(serveFunc) {
  return function(req,res) {
    Promise.resolve()
    .then(serveFunc)
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      if (error && error.stack) {console.log(error.stack)};
      res.send({error:error});
    });
  }
}

var initServer = function(input) {
  // create the webserver
  webServer = express();
  webServer.use(cors());
  webServer.get('/api/', function(req,res) {
    Promise.resolve()
    .then(serveAPI)
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      res.send({error:error});
    });
  });
  webServer.get('/', getHTMLMiddleware(serveHTML));
  return input;
};

var startServer = function(port) {
  console.log("Listening to port", port);
  webServer.listen(port);
};

// START THE SERVER
// =============================================================================
module.exports = {
  start: function(port) {
    console.log(port);
    return Promise.resolve(port)
      .then(initServer)
      .then(startServer);
  }
} 

function logger(result) {
  console.log(result);
  return result;
}

function logError(error) {
  console.error("error server:", error);
  return promise.reject(error);
}