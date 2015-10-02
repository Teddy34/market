var fetch = require('node-fetch');

var options = {
  'Accept': 'application/json',
  'Content-Type' : 'application/vnd.ccp.eve.Api-v3+json; charset=utf-8',
  'Accept-Encoding': 'gzip'
};

var fetchElement = function(element) {
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
  console.log("fetching ", url);
  return fetch(url, options)
  .then(checkSuccess)
  .then(fromJSON);
};

function checkSuccess(response) {
  if (!response || !response.status) {
    return Promise.reject("Invalid response:",response);
  }

  if (response.status === 403) {
    return Promise.reject("Refused: to many requests");
  }

  if (response.status === 409) {
    return Promise.reject("Conflict: to many requests?");
  }

  if (response.status === 500) {
    return Promise.reject("Server error. Is this downtime?");
  }

  if (response.status === 503) {
    return Promise.reject("Server error. Is this downtime? Are you overloading the server?");
  }

    console.log("fetched with response", response.status);
  return (response);
}

function fetchPoint(queryResult) {
  var items = queryResult.items;

  var concatItems = function(newQueryResult) {
    newQueryResult.items = newQueryResult.items.concat(items);
    return newQueryResult;
  };

  if (items && queryResult.next) {
    // fetch next page instead and agregate;
    return fetchElement(queryResult.next)
      .then(concatItems)
      .then(fetchPoint);

  }
  return queryResult.items;
}

function fromJSON(response) {
  return response.json();
}

module.exports = {
  fetchElement: fetchElement,
  fetchPoint: fetchPoint
};