var fetch = require('node-fetch');
var _ = require('lodash');
var tools = require('../tools');
var parameters = require('../parameters');

function fromJSON(response) {
  return response.json();
}

// data = {typeId, systemId}
var doFetch = function(data) {
  var url = parameters.eveCentralApiUrl + '?typeid=' + data.typeId + '&usesystem=' + data.systemId;
  return fetch(url)
  .then(fromJSON);
};

var throttledDoFetch = tools.promisedThrottle(doFetch, parameters.crestDelay);

module.exports = {
  fetch: throttledDoFetch
};