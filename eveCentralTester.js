var eveCentralConnector = require('./io/eveCentralConnector');
var tools = require('./tools');

var data = {typeId: 34, systemId:30000142};

eveCentralConnector.fetch(data).then(tools.logResult,tools.logError);