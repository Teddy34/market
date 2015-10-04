var sdeConnector = require('./io/sdeConnector');
var tools = require('./tools');

var getSystemIDFromSystemName = function() {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s" WHERE "solarSystemName" = \''+'Jita'+'\'');
};

var getLocationsFromSystemID = function(systemID) {
  return sdeConnector.sendQueryWhenReady('SELECT s."stationID" FROM "staStations" AS "s" WHERE "systemID" = \''+systemID+'\'');
};

var getLocationsFromSystemName = function(systemName) {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'')
};

sdeConnector.connect().then(getSystemIDFromSystemName).then(tools.logResult,tools.logError);