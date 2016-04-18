var sdeConnector = require('../io/sdeConnector');
var tools = require('../tools');

var getSystemIDFromSystemName = function(systemName) {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s" WHERE "solarSystemName" = \''+systemName+'\'');
};

var getLocationsFromSystemID = function(systemID) {
  return sdeConnector.sendQuery('SELECT s."stationID" FROM "staStations" AS "s" WHERE "systemID" = \''+systemID+'\'');
};

var getLocationsFromSystemName = function(systemName) {
  return sdeConnector.sendQuery('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'');
};

sdeConnector.connect().then(function(){return getSystemIDFromSystemName("Fliet")}).then(tools.logResult,tools.logError);
