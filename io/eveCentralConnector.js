var fetch = require('node-fetch');
var _ = require('lodash');
var tools = require('../tools');
var parameters = require('../parameters');

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
  console.log("time since last request:", now - lastRequest, "fetching:", url );
  lastRequest = now;
  
  return fetch(url,options)
  .then(fromJSON);
};

var throttledDoFetch = tools.promisedThrottle(doFetch, parameters.crestDelay);

module.exports = {
  fetch: throttledDoFetch
};