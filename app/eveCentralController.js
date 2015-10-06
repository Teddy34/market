var eveCentralConnector = require('./io/eveCentralConnector');
var tools = require('./tools');


eveCentralConnector.fetch(data).then(tools.logResult,tools.logError);

module.exports = {

};