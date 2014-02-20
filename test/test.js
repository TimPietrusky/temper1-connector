var myTemper1Connector = require("..");
console.log('connecting');





// Connect to device
var result = myTemper1Connector.connect();
console.log('connected');





// Initial value
var result = myTemper1Connector.command("read", function(value) {
  console.log(value);
});

console.log(result);





// New value every x ms
setInterval(function() {
  // Read the current value
  result = myTemper1Connector.command("read", function(value) {
    console.log(value);
  });

  console.log(result);

}, 500);