ar _ = require('lodash');
var fetch = require('node-fetch');

// function to get losses

module.exports = function get(urls) {
  var options = {
    method: 'get',
    headers:{
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'User-Agent': process.env.USER_AGENT || 'unknown'
      }
  };

  var doFetch = function(url, options) {
    console.log(url);
    return fetch(url, options).then(getJSON);
  };

  return Promise.all(_.map(urls, doFetch))
  .then(concatArrays)
};

function getJSON(response) {
  return response.json();
}

function concatArrays(results) {
  return _.reduce(results, function(memo, result) {
    return memo.concat(result);
  }, []);
}

function log(result) {
	console.log(result);
	return result;
}