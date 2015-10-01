// this module handle the crest data source. It uses the crest connector and provides crest data primitives

var _ = require('lodash');

var crestConnector = require('../io/crestConnector');

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

function getRegionEntryPoint(listObject) {
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
var getEntryPoint = _.throttle(function(strCrestEntryPointUrl) {
  return Promise.resolve(crestEntryPointUrl)
  .then(crestConnector.fetchElement);
},60*60*1000);

// functions to fetch useful data using tools seen on top

//throttled 1 hour
var fetchItems = _.throttle(function() {
    return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getItemTypes)
  .then(crestConnector.fetchElement)
  .then(getItems);
},60*60*1000);

var getRegionList = _.throttle(function() {
  return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getRegionEntryPoint)
  .then(crestConnector.fetchElement)
  .then(getItems);
},60*60*1000);

var fetchRegionMarketUrlByName = function(strRegionName) {
  return Promise.resolve()
  .then(getRegionList)
  .then(findByNamePartial(strRegionName))
  .then(crestConnector.fetchElement)
  .then(getMarketSellOrders)
  .catch(logError);
};

fetchRegionMarketUrlById = function(regionId) {
  return Promise.resolve()
  .then(getRegionList)
  .then(findRegionByIdPartial(regionId))
  .then(crestConnector.fetchElement)
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
  .then(crestConnector.fetchElement)
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
  .then(crestConnector.fetchElement)
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
  .then(crestConnector.fetchElement)
  .then(findSystemOrIterate);
};

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

  return Promise.resolve(type)
  .then(fetchItemTypeUrl)
  .then(storeTypeURL)
  .then(fetchRegionMarketUrlByIdPartial)
  .then(addParameterToRegionMarketURL)
  .then(crestConnector.fetchElement)
  .catch(logError);
};

// log utilities
function logger(input) {
  console.log(input);
  return input;
}

function logError(error) {
  console.error("Error:",error);
}

module.exports = {
  fetchMarketSellByRegionIdAndType: fetchMarketSellByRegionIdAndType
};