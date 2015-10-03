var fetch = require('node-fetch');
var primalistURL = require('../parameters').primalistURL;


function fromJSON(response) {
  return response.json();
}

module.exports = {
	fetch: function() {return fetch(primalistURL).then(fromJSON)}
}