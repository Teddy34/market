var handlebars = require('handlebars');
var iconURL = "https://image.eveonline.com/Type/";
var parameters = require('../parameters');

var source = '<html><body  onload="try{CCPEVE.requestTrust(\'{{appUrl}}\')}catch(error){}" ' +
'style="background-color: black;color: white;font-family: arial"><table><tbody><tr><td></td>' +
'<td>Pertes</td><td>En vente</td><td>Prix '+parameters.referenceSystemHub+'</td><td>'+
parameters.referenceSystemHub + ' +' + Math.round((parameters.priceRecommandedMultiplier-1) * 100 ) + '%</td><td>Nom</td>{{#items}}'+
'<tr onclick="try {CCPEVE.buyType({{typeID}})} catch(err) {};"><td><img src="{{icon typeID}}"/></td>'+
'<td>{{quantity}}</td><td>{{volumeAvailable}}</td><td>{{hubData.mean}}</td>'+
'<td>{{reasonablePrice}}</td><td>{{typeName}}</td></tr>{{/items}}</tbody></table><body><html>';

handlebars.registerHelper('icon', function(typeID) {
  return iconURL+typeID+"_32.png";
});

module.exports = handlebars.compile(source);