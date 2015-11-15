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

var connect = function(connectionString) {
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

module.exports = {
	connect:connect,
	save:save,
	getLast:getLast
};