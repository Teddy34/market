// this module handle the sde (Static Data Export base from CCP) data source. It uses the sde connector and provides sde data primitives

var sdeConnector = require('../io/sdeConnector');

var getSystemIDFromSystemName = function(systemName) {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s" WHERE "solarSystemName" = \''+systemName+'\'');
};

var getLocationsFromSystemID = function(systemID) {
  return sdeConnector.sendQueryWhenReady('SELECT s."stationID" FROM "staStations" AS "s" WHERE "systemID" = \''+systemID+'\'');
};

var getLocationsFromSystemName = function(systemName) {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'')
  .then(getRows);
};

var getItemIdByName = function(name) {
	return sdeConnector.sendQueryWhenReady('SELECT "typeID" from "invTypes" WHERE "typeName" = \''+name+'\'')
	.then(getRows);
}

function getRows(result) {
	return result.rows;
}

module.exports = {
  getSystemIDFromSystemName: getSystemIDFromSystemName,
  getLocationsFromSystemID: getLocationsFromSystemID,
  getLocationsFromSystemName: getLocationsFromSystemName,
  getItemIdByName: getItemIdByName
};