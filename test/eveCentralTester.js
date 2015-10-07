var eveCentralConnector = require('../io/eveCentralConnector');
var eveCentralController = require('../app/eveCentralController');
var tools = require('../tools');

var data = {typeId: [34,35], systemId:30000142};

//eveCentralConnector.fetch(data).then(tools.logResult,tools.logError);
eveCentralController.fetchMarketSummaryByTypeAndSystemName(data).then(tools.logResult,tools.logError);
eveCentralController.fetchMarketSummaryByTypeAndSystemName(data).then(tools.logResult,tools.logError);
eveCentralController.fetchMarketSummaryByTypeAndSystemName({typeId: 35, systemId:30000142}).then(tools.logResult,tools.logError);