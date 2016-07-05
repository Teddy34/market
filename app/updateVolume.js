var _ = require('lodash');

var specialTypeList = [
	{packagedVolume: 2500, groups:[500]},//frigate
	{packagedVolume: 5000, groups:[]},//destroyer
	{packagedVolume: 10000, groups:[]},//cruiser
	{packagedVolume: 15000, groups:[]},//battlecruiser
	{packagedVolume: 50000, groups:[]},//battleship
	{packagedVolume: 20000, groups:[]}//industrial
]

_.method = function(list, predicate) {
	var index, length, item;
	for (index = 0, length = list.length; index < list.length; index++) {
		item = list[index];
		if (predicate(item)) {
			return item;
		}
	}
	return null;
}

function updateVolume(item) {
	var newItem = _.clone(item);

	function isSpecialType(specialType) {
		return (specialType.groups.indexOf(item.typeID) >= 0);
	}

	var specialType = _.method(specialTypeList, isSpecialType);

	if (specialType) {
		newItem.volume = specialType.packagedVolume;
	}

	return newItem;
}

module.exports = updateVolume;

