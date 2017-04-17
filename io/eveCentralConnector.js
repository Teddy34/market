var fetch = require('node-fetch');
var _ = require('lodash');
var tools = require('../tools');
var parameters = require('../parameters');

function checkSuccess(response) {
  if (!response || !response.status) {
    return Promise.reject("Invalid response:",response);
  }

  if (response.status !== 200) {
    response.text().then(tools.logResult);
    throw new Error("eve central replied: "+ response.status);
  }
  
  //console.log("fetched with response", response.status);
  return (response);
}

function fromJSON(response) {
  return response.json();
}

// pool management
var lastRequest = Date.now();

// data = {typeId, systemId}
var doFetch = function(data) {
  var url = parameters.eveCentralApiUrl;
  var body = 'typeid='+data.typeId+'&usesystem='+data.systemId;
  var options = {
    method: 'post',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": body.length
    },
    body:'typeid='+data.typeId+'&usesystem='+data.systemId
  };

  var now = Date.now();
  console.log("time since last request:", now - lastRequest, "fetching:", data.typeId.length, "items at",url );
  lastRequest = now;
  
  return fetch(url,options)
  .then(checkSuccess)
  .then(fromJSON)
  .catch(_.partial(rechunkIfFailed, data))
};

var rechunkIfFailed = function(data) {
  console.log('rechunking', data.typeId.length);
  if (data.typeId.length === 1) {
    console.log('excluding', data.typeId[0]);
    return null;
  }
  return throttledDoFetch(Math.ceil(data.typeId.length/2))(data);
};

var chunkRequest = function(data, chunkSize) {

  var fetchChunk = function(typeIdChunked) {
    return doFetch({systemId: data.systemId, typeId:typeIdChunked});
  };

  var flattener = function(chunkedResults) {
    return _.flatten(chunkedResults,true);
  };

  return Promise.all(_(data.typeId).chunk(chunkSize).map(fetchChunk).value())
  .then(flattener)
  .then(_.filter)
};

var throttledDoFetch = (chunkSize) => tools.promisedThrottle(
  _.partialRight(chunkRequest, chunkSize),
   parameters.crestDelay
);

module.exports = {
  fetch: throttledDoFetch(parameters.eveCentralChunk)
};