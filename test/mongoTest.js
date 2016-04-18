var storageConnector = require('../io/storageConnector');
storageConnector.setConnectionString(require('../storageCredentials'));

//storageConnector.clean().then(function(result) {console.log(result)},function(result) {console.error(error,result)})
storageConnector.getLast().then(function(result) {console.log(result)},function(result) {console.error(error,result)})