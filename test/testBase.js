var sdeConnector = require('../io/sdeConnector');
var tools = require('../tools');

sdeConnector.setConnectionString("postgres://evesde:percevalestungrosconmaisonlaimebien@evesde.spoutnik.me.uk:15432/eve");
var getSystemIDFromSystemName = function(systemName) {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s" WHERE "solarSystemName" = \''+systemName+'\'');
};

var getLocationsFromSystemID = function(systemID) {
  return sdeConnector.sendQuery('SELECT s."solarSystemID" FROM "staStations" AS "s" WHERE "solarSystemID" = \''+systemID+'\'');
};

var getLocationsFromSystemName = function(systemName) {
  return sdeConnector.sendQuery('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'');
};

var getAllSystemId = function() {
  return sdeConnector.sendQuery('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s"');
};


sdeConnector.connect().then(function(){return getLocationsFromSystemName('DO6H-Q')})
.then((val) => console.log('test', val), (err) => console.log('ERREUR', err))

console.log('over')