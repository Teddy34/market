var handlebars = require('handlebars');
var iconURL = "https://image.eveonline.com/Type/";

var source = '<html><body style="background-color: black;color: white;font-family: arial"><table><tbody>{{#items}}<tr onclick="try {CCPEVE.showInfo({{typeID}})} catch(err) {};"><td><img src="{{icon typeID}}"/></td><td>{{quantity}}</td><td>{{typeName}}</td></tr>{{/items}}</tbody></table><body><html>';


handlebars.registerHelper('icon', function(typeID) {
  return iconURL+typeID+"_32.png";
});

module.exports = handlebars.compile(source);