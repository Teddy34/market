var crestConnector = require('../io/marketController');

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