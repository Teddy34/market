var _ = require('lodash');

var tools = require('../tools');
var crestController = require('../app/crestController');

crestController.getLocationsBySystemId('30004980')
.then(function(list) {
	console.log(list.length);
	return list;
})
.then(tools.logResult,tools.logError);