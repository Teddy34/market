var parameters = require('../parameters');;
var regionId = "1"
var REGION_LIST_POINT = "REGION_LIST_POINT",
	REGION_POINT = "REGION_POINT/region/"+regionId,
	REGION_NAME = "REGION_NAME",
	SYSTEMS_POINT = "SYSTEMS_POINT",
	CONSTELLATION_POINT = "CONSTELLATION_POINT",
	ITEM_TYPE_POINT = "ITEM_TYPE_POINT",
	MARKET_SELL_ORDERS_POINT = "MARKET_SELL_ORDERS_POINT";

var crestEndPointDummy = {
	regions: {href:REGION_LIST_POINT},
	itemTypes: {href:ITEM_TYPE_POINT}
};

var crestRegionListDummy = {
	items: [{
		href: REGION_POINT,
		name: REGION_NAME
	}]
};

var crestRegionDummy = {
	marketSellOrders: {}
}

var crestConstellationDummy = {
	systems: [{
		href: SYSTEMS_POINT
	}]
};

var crestItemTypeDummy = {

}

function fetchList(item) {
	return item.items;
}

function fetchPoint(point) {
	switch (point) {
		case REGION_LIST_POINT: {
			return crestRegionListDummy;
		}
		case parameters.crestEndPoint: {
			return crestEndPointDummy;
		}
	}
}

module.exports = {
  fetchList: fetchList,
  fetchPoint: fetchPoint
};