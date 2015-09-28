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

var getConstellations = function(region) {
  return region.constellations;
}

var getSystems = function(constellations) {
  return constellations.systems;
}

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

// functions to fetch useful data using tools seen on top

//throttled 1 hour
var fetchItems = _.throttle(function() {
    return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getItemTypes)
  .then(fetchElement)
  .then(getItems);
},60*60*1000);

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
  }

  var partialSearchInConstellationList = function(err) {
    if (err === "not found") {
      return searchSystemInConstellationsList(name, constellationList);
    }
    return Promise.reject(err);
  }

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
  }

  var partialSearchInRegions = function(err) {
    if (err === "not found") {
      return searchSystemInRegionList(name, regionList);
    }
    return Promise.reject(err);
  }

  var findSystemOrIterate = function(region) {
    return Promise.resolve(region)
      .then(partialSearchInConstellationsList)
      .catch(partialSearchInRegions);
  };

  return Promise.resolve(firstRegion)
  .then(fetchElement)
  .then(findSystemOrIterate);
};

var fetchSystemUrlByName = function(name) {

  var partialSearchInRegionList = function(regionList) {
    return searchSystemInRegionList(name, regionList)
  }
 
  return Promise.resolve(crestEntryPointUrl)
  .then(getEntryPoint)
  .then(getRegions)
  .then(fetchElement)
  .then(getItems)
  .then(partialSearchInRegionList);
};

var fetchMarketSellByRegionAndType = function(region, type) {
  var itemTypeURL;
  var storeTypeURL = function storeTypeURL (url) {
    itemTypeURL = url;
  }

  var addParameterToRegionMarketURL = function (marketURL) {
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

var logElement = function(elementList) {
  console.log(elementList.items[0]);
}
//fetchMarketSellByRegionAndType('The Forge', 2195).then(logElement)

var testConstellation = {
  "position": {
    "y": 64999452632293260,
    "x": -134996400468185440,
    "z": 103325617317521340
  },
  "region": {
    "href": "https://public-crest.eveonline.com/regions/10000002/"
  },
  "systems": [
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000139/"
    },
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000140/"
    },
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000141/"
    },
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000142/"
    },
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000143/"
    },
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000144/"
    },
    {
      "href": "https://public-crest.eveonline.com/solarsystems/30000145/"
    }
  ],
  "name": "Kimotoro"
};

/*searchSytemInConstellation("Jita", testConstellation)
.then(logger)
.catch(logError)*/

var testRegion = {
  "description": "\"The greater the State becomes, the greater humanity under it flourishes.\"",
  "marketBuyOrders": {
    "href": "https://public-crest.eveonline.com/market/10000002/orders/buy/"
  },
  "name": "The Forge",
  "constellations": [
    {
      "href": "https://public-crest.eveonline.com/constellations/20000017/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000018/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000019/"
    },
    /*{
      "href": "https://public-crest.eveonline.com/constellations/20000020/"
    },*/
    {
      "href": "https://public-crest.eveonline.com/constellations/20000021/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000022/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000023/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000024/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000025/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000026/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000027/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000028/"
    },
    {
      "href": "https://public-crest.eveonline.com/constellations/20000029/"
    }
  ],
  "marketSellOrders": {
    "href": "https://public-crest.eveonline.com/market/10000002/orders/sell/"
  }
};

/*searchSystemInConstellationsList('Jita', testRegion.constellations)
.then(logger)
.catch(logError)*/

fetchSystemUrlByName('Jita')
.then(logger)
.catch(logError);