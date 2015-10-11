var _ = require('lodash');

var tools = require('../tools');
var crestConnector = require('../io/crestConnector');

crestConnector.fetchPoint("toto").then(tools.logResult,tools.logError);