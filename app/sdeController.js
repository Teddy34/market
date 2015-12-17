// this module handle the sde (Static Data Export base from CCP) data source. It uses the sde connector and provides sde data primitives

var sdeConnector = require('../io/sdeConnector');

var getSystemIDFromSystemName = function(systemName) {
  // should have 0 or 1 answer

  function parse(resultList) {
    if (resultList.length === 0) {
      throw new Error('System not found');
    }
    if (resultList.length > 1) {
      throw new Error('Unexpexted number of systems ('+ resultList.length+ ') found with name'+systemName);
    }
    return resultList.shift().solarSystemID;
  }

  return sdeConnector.sendQuery('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s" WHERE "solarSystemName" = \''+systemName+'\'')
  .then(getRows)
  .then(parse);
};

var getLocationsFromSystemID = function(systemID) {
  return sdeConnector.sendQuery('SELECT s."stationID" FROM "staStations" AS "s" WHERE "systemID" = \''+systemID+'\'');
};

var getLocationsFromSystemName = function(systemName) {
  return sdeConnector.sendQuery('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'')
  .then(getRows);
};

var getItemIdByName = function(name) {
	return sdeConnector.sendQuery('SELECT "typeID" from "invTypes" WHERE "typeName" = \''+name+'\'')
	.then(getRows);
};

var connect = function() {
  return sdeConnector.connect();
};

var disconnect = function() {
  return sdeConnector.disconnect();
}

function getRows(result) {
	return result.rows;
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  getSystemIDFromSystemName: getSystemIDFromSystemName,
  getLocationsFromSystemID: getLocationsFromSystemID,
  getLocationsFromSystemName: getLocationsFromSystemName,
  getItemIdByName: getItemIdByName
};