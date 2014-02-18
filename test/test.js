var myTemper1Connector = require("..");

var result = myTemper1Connector.connect();

setInterval(function() {
  myTemper1Connector.command("read");
}, 2500);

// console.log("Devices found:"+devices[0]);

// thermometers.readTemperature(devices[0], function(err, value) {
//   console.log("Result:"+value);
// });

// var assert = require("assert");

// describe('result', function(){
//     it('should return -1 when the value is not present', function(){
//       assert.equal(-1, [1,2,3].indexOf(5));
//       assert.equal(-1, [1,2,3].indexOf(0));
//     })
// })