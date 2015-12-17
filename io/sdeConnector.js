var pg = require('pg');
var _ = require('lodash');

var client = null;
var connectionString;

var setConnectionString = function(newConnectionString) {
  connectionString = newConnectionString;
};

var connect = function() {

  if (!connectionString) {
    return Promise.reject("no connection string");
  }

  client = new pg.Client(connectionString);

  return new Promise(function(resolve, reject) {
      client.connect(function(err) {
      if(err) {
        console.error('Error unable to connect to database:', err);
        reject(err);
      }
      else {
        console.info('Database connected');
        resolve(client);
      }
    });
  });
};

var disconnect = function(value) {
  client.end();
  return value;
};


var sendQuery = function(query) {
  
  return new Promise(function(resolve, reject) {
    client.query(query, function(err, rows, cols){
      if(!err){
        resolve(rows);
      } else {
        reject(err);
      }
    });
  });

};

module.exports = {
  setConnectionString: setConnectionString.bind(this),
  sendQuery: sendQuery.bind(this),
  disconnect: disconnect.bind(this),
  connect: connect.bind(this)
};