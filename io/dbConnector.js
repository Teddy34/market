var pg = require('pg');
var _ = require('lodash');
var clientConnected = null;

var connect = _.once(function(connectionString) {
  return clientConnected = new Promise(function(resolve, reject) {
      pg.connect(connectionString, function(err, client, done) {
      if(err) {
        console.error('Error unable to connect to database:', err)
        reject(err);
      }
      else {
        console.info('Database connected');
        resolve(client);
      }
    });
  });
});

var sendQueryWhenReady = function(query) {
  if (!clientConnected) {
    return Promise.reject('Maybe you want to connect to the database first');
  }

  function sendQuery(client){
    return new Promise(function(resolve, reject) {
      client.query(query, function(err, rows, cols){
        if(!err){
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  }
  return clientConnected.then(sendQuery);
};

module.exports = {
  connect: connect,
  sendQueryWhenReady: sendQueryWhenReady
};