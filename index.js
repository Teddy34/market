var fetch = require('node-fetch');
var _ = require('lodash');

var crestEntryPointUrl = "https://public-crest.eveonline.com/";
var options = {
  'Accept': 'application/json',
  'Content-Type' : 'application/vnd.ccp.eve.Api-v3+json; charset=utf-8',
  'Accept-Encoding': 'gzip'
};

var fetchUrl = function(url) {
  return fetch(url, options)
  .then(toJSON);
  //.then(loadPages);
};

function toJSON(response) {
  return response.json();
}

function loadPages(queryResult) {
  if (queryResult.next) {
    // fetch next page instead and agregate;
    return queryResult.items;
  }
  return queryResult.items;
}

function logger(input) {
  console.log(input);
  return input;
}

function logError(error) {
  console.error("Error:",error);
}

function getRefUrl (item) {
  if (! item || !item.href) {
    throw new Error("href not found");
  }
  return item.href;
}

function getItems(result) {
  if (!result || !result.items) {
   throw new Error("getItems: wrong result");
 }
 return result.items;
}

var findByProp = function( list, strProp, strPropValue) {
  var propObject = {};
  propObject[strProp] = strPropValue;
  return _.findWhere(list, propObject);
};

var findByName = function( list, strName ) {
  return findByProp(list, 'name', strName);
};

var findByNamePartial = function(strName) {
  return function(list) {
    return findByName(list, strName);
  };
};

var getRegions = function(listObject) {
  return listObject.regions;
};

var getItemTypes = function(listObject) {
  return listObject.itemTypes;
}

var getMarketSellOrders = function(region) {
  return Promise.resolve(region.marketSellOrders);
};

var fetchRegionMarketUrl = function(strRegionName) {
  return Promise.resolve(crestEntryPointUrl)
  .then(fetchUrl)
  .then(getRegions)
  .then(getRefUrl)
  .then(fetchUrl)
  .then(getItems)
  .then(findByNamePartial(strRegionName))
  .then(getRefUrl)
  .then(fetchUrl)
  .then(getMarketSellOrders)
  .then(getRefUrl);
};

var fetchItemSellOrders = function(itemNumber) {

};

fetchRegionMarketUrl('The Forge')
.then(logger)
.catch(logError);