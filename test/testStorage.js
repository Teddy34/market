var storageConnector = require('../io/storageConnector');
var tools = require('../tools');
var storageConnectionString = require('../parameters').storageConnectionString;

var dataMock = {  
   data:[  
      {  
         typeID:652,
         typeName:'Toto3',
         groupID:28,
         volume:255000,
         marketGroupID:82,
         quantity:1,
         mean:1851594.86,
         weightedMean:1577869.32,
         minSell:2698976.33,
         buyMax:1355101.34,
         typeId:652,
         volumeAvailable:0,
         reasonablePrice:3103822.78,
         hubData:{  
            mean:2698976.33
         }
      }],
   timestamp:1447591362344
};

storageConnector.setConnectionString(storageConnectionString);
Promise.resolve()
//.then(function() {return storageConnector.save(dataMock);})
.then(function() {return tools.setTimeoutPromised(300);})
.then(function() {return storageConnector.getLast();})
.then(function(result) {console.log('result'); return result;})
.then(tools.logResult)
.catch(tools.logError)
.then(storageConnector.disconnect, storageConnector.disconnect);