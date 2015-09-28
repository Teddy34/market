var fetch = require('node-fetch');
var _ = require('lodash');

var crestEntryPointUrl = "https://public-crest.eveonline.com/";
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
  .then(toJSON);
};

function toJSON(response) {
  console.log("fetched with response", response.status);
  return response.json();
}

function getItems(queryResult) {
  var items = queryResult.items;

  var concatItems = function(newQueryResult) {
    newQueryResult.items = newQueryResult.items.concat(items);
    return newQueryResult;
  }

  if (items && queryResult.next) {
    // fetch next page instead and agregate;
    return fetchElement(queryResult.next)
      .then(concatItems)
      .then(getItems);

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

function containsId(strToSearch, strKeyword, strID) {
  return new RegExp(strKeyword+'/'+strID+'/').exec(strToSearch);
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

var getEntryPoint = function(strCrestEntryPointUrl) {
  return Promise.resolve(crestEntryPointUrl)
  .then(fetchElement);
}

var getMarketSellOrders = function(region) {
  return region.marketSellOrders;
};

var fetchRegionMarketUrl = function(strRegionName) {
  return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getRegions)
  .then(fetchElement)
  .then(getItems)
  .then(findByNamePartial(strRegionName))
  .then(fetchElement)
  .then(getMarketSellOrders) 
  .catch(logError);
};

//throttled 1 hour
var fetchItems = _.throttle(function() {
    return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getItemTypes)
  .then(fetchElement)
  .then(getItems);
},60*60*1000);

var fetchItemTypeUrl = function(itemNumber) {

  var find = function(itemList) {
    return _.find(itemList, function(item) {
      return containsId(item.href,'types',itemNumber);
    });
  }

  return Promise.resolve()
  .then(fetchItems)
  .then(find)
  .then(getRefUrl)
  .then(logger)
  .catch(logError);
};

var fetchMarketSellByRegionAndType = function(region, type) {
  var itemTypeURL;
  var storeTypeURL = function storeTypeURL (url) {
    console.log('store in closire:',url);
    itemTypeURL = url;
  }

  var addParameterToRegionMarketURL = function (marketURL) {
    console.log('addParameterToRegionMarketURL',marketURL,itemTypeURL);
    return marketURL+'?type='+itemTypeURL;
  }

  var fetchRegionMarketUrlPartial = function() {
    return fetchRegionMarketUrl(region).then(getRefUrl);
  }

  var logElement = function(elementList) {
    console.log(elementList.items[0]);
  }

  Promise.resolve(type)
  .then(fetchItemTypeUrl)
  .then(storeTypeURL)
  .then(fetchRegionMarketUrlPartial)
  .then(logger)
  .then(addParameterToRegionMarketURL)
  .then(fetchElement)
  .then(logElement)
  .catch(logError)
}

/*fetchRegionMarketUrl('The Forge')
.then(logger)
.catch(logError);*/

//fetchItemTypeUrl(2195);
//fetchItemTypeUrl(2195);
//fetchItemTypeUrl(2196);
//console.log(!!containsId('htttred:types/122345/','types','1223455'));

fetchMarketSellByRegionAndType('The Forge', 2195)

