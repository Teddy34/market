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
  .then(checkSuccess)
  .then(toJSON);
};

function checkSuccess(response) {
  if (!response || !response.status) {
    return Promise.reject("Invalid response:",response);
  }

  if (response.status === 409) {
    return Promise.reject("To many requests");
  }

  if (response.status === 500) {
    return Promise.reject("Server error. Is this downtime ?");
  }

  if (response.status === 503) {
    return Promise.reject("Server error. Is this downtime ? Are you loading the server ?");
  }

    console.log("fetched with response", response.status);
  return (response);
}

function toJSON(response) {
  return response.json();
}

function getItems(queryResult) {
  var items = queryResult.items;

  var concatItems = function(newQueryResult) {
    newQueryResult.items = newQueryResult.items.concat(items);
    return newQueryResult;
  };

  if (items && queryResult.next) {
    // fetch next page instead and agregate;
    return fetchElement(queryResult.next)
      .then(concatItems)
      .then(getItems);

  }
  return queryResult.items;
}

// log utilities
function logger(input) {
  console.log(input);
  return input;
}

function logError(error) {
  console.error("Error:",error);
}

function logCount(result) {
  console.log("returned: ",result.items.length);
  return result;
}
function logFirst(result) {
  console.log(result.items[0]);
  return result;
}

//Math Utilities

function roundXDigits(number, digits) {
  var rounder = Math.pow(10,digits);
  return Math.round(rounder*number)/rounder;
};

function doStatAnalysis(array) {
  if (!array || !array.length) {
    throw new Error("empty list for doStatAnalysis");
  }

  var mean = array.reduce(function(a, b){return a+b;})/array.length;
  var dev= array.map(function(itm){return (itm-mean)*(itm-mean);});
  var stDeviation = Math.sqrt(dev.reduce(function(a, b){return a+b;})/array.length);
  var relStdDeviation =stDeviation/mean;
  return {mean: roundXDigits(mean,2), stDeviation: stDeviation, relStdDeviation: roundXDigits(relStdDeviation,5)};
};

// search utilities
function containsId(strToSearch, strKeyword, strID) {
  return new RegExp(strKeyword+'/'+strID+'/').exec(strToSearch);
}

// returns first entry where condition is satisfied and stop the loop
var findInUrl = function(itemList, propertyName, propertyValue) {
  return _.find(itemList, function(item) {
      return containsId(item.href,propertyName,propertyValue);
  });
};

// partial application pattern. That could be replaced a more generic function (see Javascript Allongé)
var findInUrlPartial = function(propertyName, propertyValue) {
  return function(list) {
    return findInUrl(list, propertyName, propertyValue);
  };
};

// returns first entry where condition is satisfied and stop the loop
var findByProperty = function( list, strProp, strPropValue) {
  var propObject = {};
  propObject[strProp] = strPropValue;
  return _.findWhere(list, propObject);
};

// partial application pattern. That could be replaced a more generic function (see Javascript Allongé)
var findByPropertyPartial = function(strProp, strPropValue) {
  return function(list) {
    return findByProperty(list, strProp, strPropValue);
  };
};

// high lvl partial patterns
var findByNamePartial = function(strName) {
  return findByPropertyPartial('name', strName);
};

var findRegionByIdPartial = function(regionId) {
  return findInUrlPartial('regions', regionId);
};

// simple fixed pluck decorators

function getRegions(listObject) {
  return listObject.regions;
}

function getConstellations(region) {
  return region.constellations;
}

function getSystems(constellations) {
  return constellations.systems;
}

function getItemTypes(listObject) {
  return listObject.itemTypes;
}

function getMarketSellOrders(region) {
  return region.marketSellOrders;
}

function getRefUrl (item) {
  if (! item || !item.href) {
    throw new Error("href not found");
  }
  return item.href;
}

// CREST entry point (end point ?)
var getEntryPoint = function(strCrestEntryPointUrl) {
  return Promise.resolve(crestEntryPointUrl)
  .then(fetchElement);
};



// functions to fetch useful data using tools seen on top

//throttled 1 hour
var fetchItems = _.throttle(function() {
    return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getItemTypes)
  .then(fetchElement)
  .then(getItems);
},60*60*1000);

var fetchRegionMarketUrlByName = function(strRegionName) {
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

fetchRegionMarketUrlById = function(regionId) {
    return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getRegions)
  .then(fetchElement)
  .then(getItems)
  .then(findRegionByIdPartial(regionId))
  .then(fetchElement)
  .then(getMarketSellOrders)
  .catch(logError);
};

var fetchItemTypeUrl = function(itemNumber) {

  var find = function(itemList) {
    return findInUrl(itemList, 'types', itemNumber);
  };

  return Promise.resolve()
  .then(fetchItems)
  .then(find)
  .then(getRefUrl)
  .then(logger)
  .catch(logError);
};

var searchSystemInSystemList = function(name, systemList) {
  var firstSystem = systemList.shift();

  if (!firstSystem) {return Promise.reject("not found");}

  var findSystemOrIterate = function(system) {
    if (system.name === name) {
      return system;
    }
    return searchSystemInSystemList(name, systemList);
  };

  return Promise.resolve(firstSystem)
  .then(fetchElement)
  .then(findSystemOrIterate);
};

var searchSytemInConstellation = function(name, constellation) {

  var partialSearch = function(systems) {
    return searchSystemInSystemList(name, systems);
  };

  return Promise.resolve(constellation)
  .then(getSystems)
  .then(partialSearch);
};

var searchSystemInConstellationsList = function(name, constellationList) {
  var firstConstellation = constellationList.shift();

  if (!firstConstellation) {return Promise.reject("not found");}

  var partialSearchInConstellation = function(constellation) {
    return searchSytemInConstellation(name, constellation);
  };

  var partialSearchInConstellationList = function(err) {
    if (err === "not found") {
      return searchSystemInConstellationsList(name, constellationList);
    }
    return Promise.reject(err);
  };

  var findSystemOrIterate = function(constellation) {
    return Promise.resolve(constellation)
      .then(partialSearchInConstellation)
      .catch(partialSearchInConstellationList);
  };

  return Promise.resolve(firstConstellation)
  .then(fetchElement)
  .then(findSystemOrIterate);
};


var searchSystemInRegionList = function(name, regionList) {
  var firstRegion= regionList.shift();

  if (!firstRegion) {return Promise.reject("not found");}

  var partialSearchInConstellationsList = function(region) {
    return searchSystemInConstellationsList(name, region.constellations);
  };

  var partialSearchInRegions = function(err) {
    if (err === "not found") {
      return searchSystemInRegionList(name, regionList);
    }
    return Promise.reject(err);
  };

  var findSystemOrIterate = function(region) {
    return Promise.resolve(region)
      .then(partialSearchInConstellationsList)
      .catch(partialSearchInRegions);
  };

  return Promise.resolve(firstRegion)
  .then(fetchElement)
  .then(findSystemOrIterate);
};

//warning: will request LOTS of things to CREST
/*var fetchSystemUrlByName = function(name) {

  var partialSearchInRegionList = function(regionList) {
    return searchSystemInRegionList(name, regionList);
  };
 
  return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getRegions)
  .then(fetchElement)
  .then(getItems)
  .then(partialSearchInRegionList);
};*/

var fetchMarketSellByRegionIdAndType = function(regionId, type) {
  var itemTypeURL;
  var storeTypeURL = function storeTypeURL (url) {
    itemTypeURL = url;
  };

  var addParameterToRegionMarketURL = function (marketURL) {
    return marketURL+'?type='+itemTypeURL;
  };

  var fetchRegionMarketUrlByIdPartial = function() {
    return fetchRegionMarketUrlById(regionId).then(getRefUrl);
  };

  var logElement = function(elementList) {
    console.log(elementList.items[0]);
  };

  return Promise.resolve(type)
  .then(fetchItemTypeUrl)
  .then(storeTypeURL)
  .then(fetchRegionMarketUrlByIdPartial)
  .then(logger)
  .then(addParameterToRegionMarketURL)
  .then(fetchElement)
  .catch(logError);
};

/*fetchRegionMarketUrl('The Forge')
.then(logger)
.catch(logError);*/

//fetchItemTypeUrl(2195);
//fetchItemTypeUrl(2195);
//fetchItemTypeUrl(2196);
//console.log(!!containsId('htttred:types/122345/','types','1223455'));

//fetchMarketSellByRegionAndType('The Forge', 448).then(logElement);

/*var testConstellation = require('./dummyObjects').constellation;

searchSytemInConstellation("Jita", testConstellation)
.then(logger)
.catch(logError);*/

/*var testRegion = require('./dummyObjects').region;

searchSystemInConstellationsList('Jita', testRegion.constellations)
.then(logger)
.catch(logError)*/

/*fetchSystemUrlByName('Jita')
.then(logger)
.catch(logError);*/

require('./io/eveSDE').connect(require('./databaseCredentials'));

var getSystemData = function(systemName) {
  return require('./io/eveSDE').getLocationsFromSystemName(systemName);
};

var getStationIDList = function(systemData) {return Promise.resolve(systemData).then(function(list) {return _.pluck(list, 'stationID');});};


var filterBySystem = function(results) {
  var marketOrders = results[0];
  var stationIDList = results[1];

  var predicate = function(order) {
    return (stationIDList.indexOf(order.location.id_str) !== -1 );
  };

  return _.filter(marketOrders.items, predicate);
};

/*Promise.all([fetchMarketSellByRegionIdAndType('10000064', 448), getSystemData('Fliet').then(getStationIDList)])
.then(filterBySystem)
.then(logger)
.catch(logError);*/

var fetchMarketSellByTypeAndSystemName = function(typeId, systemName) {

  var getMarketSellOrders = function(systemData) {
    getStationIDList(systemData).then(logger);
    return Promise.all([fetchMarketSellByRegionIdAndType(systemData[0].regionID, typeId), getStationIDList(systemData)])
    .then(filterBySystem);
  };

  return getSystemData(systemName)
  .then(getMarketSellOrders);
};

var decorateOrders = function(orders) {
  return _(orders).map(function(order) {return {price: order.price, volume: order.volume};}).sortBy('price').value();
};

//getSystemData('Fliet')
/*fetchMarketSellByTypeAndSystemName(448, 'Dodixie')
.then(decorateOrders)*/

var getAverageCheapestPrice = function(orderList, number) {
  return _.chain(orderList).take(Math.min(orderList.length, number)).pluck('price').thru(doStatAnalysis).value();
};

var getAverageCheapestPricePartial = function(number) {
  return function(orderList) {
    return getAverageCheapestPrice(orderList, number);
  };
};

var getPriceReference = function(itemId) {

  function decorate(analysedPrice) {
    analysedPrice.itemId = itemId;
    return analysedPrice;
  }

  return fetchMarketSellByTypeAndSystemName(itemId, 'Dodixie')
  .then(decorateOrders)
  .then(getAverageCheapestPricePartial(3))
  .then(decorate);
};

var filterOrdersByPriceTreshold = function(orderList, treshold) {
  var predicate = function(order) {
    return (order.price <= treshold);
  };
  return _.filter(orderList, predicate);
};

var getStockAtReasonablePrice = function(itemId, systemName, nReasonable) {

  var fetchData = function() {

    var systemSellOrders = fetchMarketSellByTypeAndSystemName(itemId, systemName);
    var priceReference = getPriceReference(itemId);

    return Promise.all([systemSellOrders, priceReference]);
  };

  var getReasonablePrice = function(results) {
    return nReasonable * results[1].mean;
  };

  var filterPartial = function(results) {
    return filterOrdersByPriceTreshold(results[0], getReasonablePrice(results));
  };

  var mergeData = function(results) {
    var volumeAvailable = _(results).thru(filterPartial).reduce(reduceVolume, 0);
    return {
      itemId: itemId,
      systemName: systemName,
      hubData : results[1],
      reasonablePrice: getReasonablePrice(results),
      volumeAvailable: volumeAvailable
    };
  };

  return Promise.resolve()
    .then(fetchData)
    .then(mergeData);
};

var reduceVolume = function(memo, order) {
  return memo += order.volume;
};

getMultipleStocksAtReasonablePrice = function(typeIdList, systemName, reasonablePrice) {

  var partial = function(typeId) {
    return getStockAtReasonablePrice(typeId, systemName, reasonablePrice);
  };

  return Promise.all(_.map(typeIdList,partial));
};

//getPriceReference(448)
//predicate()
//fetchMarketSellByTypeAndSystemName(608, 'Dodixie')
//getStockAtReasonablePrice(448, 'Fliet', 1.15)
getMultipleStocksAtReasonablePrice([448, 608, 17841], 'Fliet', 1.15)
//.then(decorateOrders)
.then(logger)
.catch(logError);

/*fetchMarketSellByRegionAndType('Essence', 448)
.then(logCount)
.then(logFirst)
.catch(logError);*/