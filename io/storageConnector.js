var mongoose = require('mongoose');
var connectionPromise;

var marketDataSchema = mongoose.Schema({
    data: [{
			typeID:Number,
			typeName:String,
			groupID:Number,
			volume:Number,
			marketGroupID:Number,
			quantity:Number,
			mean:Number,
			weightedMean:Number,
			minSell:Number,
			buyMax:Number,
			typeId:Number,
			volumeAvailable:Number,
			reasonablePrice:Number,
			hubData:{  
				mean:Number
			}
    }],
    timestamp: Date
});

var MarketData= mongoose.model('MarketData', marketDataSchema);

var connectionString;

var setConnectionString = function(newConnectionString) {
	connectionString = newConnectionString;
};

var connect = function() {
	return connectionPromise = new Promise(function(resolve, reject) {
		mongoose.connect(connectionString, function(err) {
	    	if (err) {
	    		reject(err);
	    	} else {
	    		resolve();
	    	}
		}); // connect to our database
	});
};

var disconnect = function() {
	return connectionPromise = new Promise(function(resolve, reject) {
		mongoose.disconnect(function(err) {
	    	if (err) {
	    		reject(err);
	    	} else {
	    		resolve();
	    	}
		}); // disconnect to our database
	});
}

var save = function(marketData) {
	var deferred = Promise.defer();
	var marketDataModel = new MarketData(marketData);
	marketDataModel.save(function(err,data) {
		if (err) {
			deferred.reject(err);
    	} else {
    		deferred.resolve(data);
    	}
	});
	return deferred.promise;
};

var clearCollection = function() {
	var deferred = Promise.defer();
	MarketData.remove({}, function(err,data) {
		if (err) {
			deferred.reject(err);
    	} else {
    		deferred.resolve(data);
    	}
	});
	return deferred.promise;
};

var saveCollection = function(marketData) {
	return Promise.resolve()
	.then(clearCollection)
	.then(function() {return save(marketData)});
};

var getLast = function() {
	var deferred = Promise.defer();

	var callback = function(err, marketData) {
		if (err) {
			deferred.reject(err);
    	} else {
    		deferred.resolve(marketData);
    	}
	}

	MarketData.findOne().sort({ field: 'asc', _id: -1 }).limit(1).lean().exec(callback);
	return deferred.promise;
};

var wrapCommand = function(command) {
	return function(data) {
		var returnValue;
		return Promise.resolve()
		.then(connect)
		.then(function() {return returnValue = command(data);})
		.then(disconnect)
		.then(function() {return returnValue;})
		.catch(function(err) {console.log('storageConnector issue'); return Promise.reject(err);});
	}
};

module.exports = {
	setConnectionString:setConnectionString,
	save: wrapCommand(saveCollection),
	clean: wrapCommand(clearCollection),
	getLast: wrapCommand(getLast)
};