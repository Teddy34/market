var handlebars = require('handlebars');
var iconURL = "https://image.eveonline.com/Type/";
var parameters = require('../parameters');

var source = '<html><body ' +
'style="background-color: black;color: white;font-family: arial">'+
'<div>Latest update: {{timestamp}}</div>' +
'<table><tbody><tr><td></td>' +
'<td>Losses</td><td>To sell</td><td>'+parameters.referenceSystemHub+' price</td><td>'+
parameters.referenceSystemHub + ' +' + Math.round((parameters.priceRecommandedMultiplier-1) * 100 ) + '%</td><td>Name</td>{{#items}}'+
'<tr><td><img src="{{icon typeID}}"/></td>'+
'<td>{{quantity}}</td><td>{{volumeAvailable}}</td><td>{{hubData.mean}}</td>'+
'<td>{{reasonablePrice}}</td><td>{{typeName}}</td></tr>{{/items}}</tbody></table><body><html>';

handlebars.registerHelper('icon', function(typeID) {
  return iconURL+typeID+"_32.png";
});

module.exports = handlebars.compile(source);