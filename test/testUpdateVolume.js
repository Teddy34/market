var updateVolume = require('../app/updateVolume');

var module = {typeID: 335, volume: 5};
var condor = {typeID: 500, volume: 38000};

console.log("test module volume:", updateVolume(module).volume);
console.log("test condor volume:", updateVolume(condor).volume);

