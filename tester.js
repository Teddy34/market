var sdeConnector = require('./io/sdeConnector');
var tools = require('./tools');

var getLocationsFromSystemName = function(systemName) {
  //return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+'Jita'+'\'')
	return sdeConnector.sendQueryWhenReady('SELECT "staStations"."stationID" FROM "staStations"');
};


sdeConnector.connect().then(getLocationsFromSystemName).then(tools.logResult,tools.logError)

