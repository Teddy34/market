var fetch = require('node-fetch');
var _ = require('lodash');
var tools = require('../tools');
var parameters = require('../parameters');

var options = {
  'Accept': 'application/json',
  'Content-Type' : 'application/vnd.ccp.eve.Api-v3+json; charset=utf-8',
  'Accept-Encoding': 'gzip'
};

// pool management
var lastRequest = Date.now();
var retryList = [];

function checkSuccess(response) {
  if (!response || !response.status) {
    return Promise.reject("Invalid response:",response);
  }

  switch(response.status) {
    case 403: return Promise.reject(new Error("Refused: to many requests"));
    case 404: return Promise.reject(new Error("Refused: ressource not found"));
    case 409: return Promise.reject(new Error("Conflict: to many requests?"));
    case 500: return Promise.reject(new Error("Server error. Is this downtime?"));
    case 503: return Promise.reject(new Error("Server error. Is this downtime? Are you overloading the server?"));
  }
  
  //console.log("fetched with response", response.status);
  return (response);
}

function fromJSON(response) {
  return response.json();
}

var retry = function(error, url) {
  var index = retryList.indexOf(url);
  if (index >=0) {
    removingRetry(index);
    throw error;
  }
  retryList.push(url);

  function removingRetry(optionalIndex) {
    retryList.splice(optionalIndex!== undefined?optionalIndex:retryList.indexOf(url),1);
  }

  function handleRetrySuccess(result) {
    removingRetry();
    return result;
  }

  return throttledFetchPoint(url)
  .then(handleRetrySuccess);
};

var fetchPoint = function(element) {
  var url = null;

  if (_.isObject(element) && element.href) {
    url = element.href;
  }
  else if (_.isString(element)) {
    url = element;
  }
  if (!url) {
    throw new Error("Wrong element to fetch:"+element.toSring());
  }

  console.log(url)

  var now = Date.now();
  //console.log("time since last request:", now - lastRequest, "fetching:", url );
  lastRequest = now;

  var retryPartial = function(error) {
    console.log("retrying ",url);
    return retry(error, url);
  };

  var logMultipleErrors = function(error) {
    console.log("Multiple fails for ",url)
    return Promise.reject(error);
  }
  
  //console.log("fetching ",url );
  return fetch(url,options)
  .then(checkSuccess)
  .then(fromJSON)
  .catch(retryPartial)
  .catch(logMultipleErrors);
};

function fetchList(queryResult) {
  var items = queryResult.items;

  //console.log("fetching",items.length,"items from crest");

  var concatItems = function(newQueryResult) {
    newQueryResult.items = newQueryResult.items.concat(items);
    return newQueryResult;
  };

  if (items && queryResult.next) {
    // fetch next page instead and agregate;
    return throttledFetchPoint(queryResult.next)
      .then(concatItems)
      .then(fetchList);
  }
  return queryResult.items;
}

var throttledFetchPoint = tools.promisedThrottle(fetchPoint, parameters.crestDelay);

module.exports = {
  fetchList: fetchList,
  fetchPoint: throttledFetchPoint
};