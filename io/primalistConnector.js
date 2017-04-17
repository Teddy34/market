var fetch = require('node-fetch');
var primalistURL = require('../parameters').primalistURL;
var result = require('../zkillboarddata.json');
var _ = require('lodash/fp');


function fromJSON(response) {
  return response.json();
}

function logRequest(url) {
  console.log("Getting item list from", url);
  return url;
}

function logCount(itemList) {
  console.log("Got a list of ",itemList.length, "items");
  return itemList;
}

module.exports = {
	fetch: () => Promise.resolve(result.slice(2490))
	//fetch: function() {return Promise.resolve(primalistURL).then(logRequest).then(fetch).then(fromJSON)}
};