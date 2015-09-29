var dbConnector = require('./dbConnector');
var _ = require('lodash');

var connect = function(connectionString) {
  return dbConnector.connect(connectionString);
}

var getSystemIDFromSystemName = function(systemName) {
  return dbConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName" FROM "mapSolarSystems" AS "s" WHERE "solarSystemName" = \''+systemName+'\'');
};

var getLocationsFromSystemID = function(systemID) {
  return dbConnector.sendQueryWhenReady('SELECT s."stationID" FROM "staStations" AS "s" WHERE "systemID" = \''+systemID+'\'');
};

var getLocationsFromSystemName = function(systemName) {
  return dbConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'');
};

module.exports = {
  connect: connect,
  getSystemIDFromSystemName: getSystemIDFromSystemName,
  getLocationsFromSystemID: getLocationsFromSystemID,
  getLocationsFromSystemName: getLocationsFromSystemName
};