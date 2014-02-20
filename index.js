'use strict';


/*
 *
 * Imports
 * 
 */

// https://github.com/node-hid/node-hid
var HID = require('node-hid');





/*
 *
 * Application logic
 *
 */

/*
 * Constructor
 */
function Temper1Connector() {
  // Options
  this.options = {
    // Decimal ID of the USB vendor 
    vendorID : 3141, 
    // Decimal ID of the USB product
    productID : 29697,
    // Decimal value of the USB interface
    interfaceValue : 1,

    // Command: Read data
    read  : [1, 128, 51, 1, 0, 0, 0, 0]
  };

  // Messages 
  this.messages = {
    connected : 'connected',
    notConnected : 'not connected',
    success : 'success',
    notSupported : 'not supported',
    errorNoDevice : 'Cannot write to HID device'
  };

  // Array of devices
  this.devices = null;

  // A single device
  // @TODO [TimPietrusky] - Allow more devices
  this.device = null;
}





/**
 * Connect to the USB devices.
 */
Temper1Connector.prototype.connect = function() {
  var result = this.messages.notConnected;

  // Get all USB-HID devices
  this.devices = HID.devices();

  // Reset device
  this.device = null;

  // Iterate over all USB-HID devices
  this.devices.forEach(function(element, index) {

    // Get the path of the real device if vendorID & productID match
    if (element.vendorId == this.options.vendorID 
        && element.productId == this.options.productID
        && element.interface == this.options.interfaceValue) {

      // Open the device
      this.device = new HID.HID(element.path);

      // Set the result
      result = this.messages.connected;
    }

  }, this);

  return result;
};





/**
 * Send a command to the USB device
 */
Temper1Connector.prototype.command = function(command, callback) {
  var result = this.messages.success,
      callback = callback || null,
      temperature = null
  ;

  // Do nothing if no device is connected & the command is not "connect"
  if (this.device == null && command !== 'connect') {
    // Try to connect
    result = this.connect();

  // Execute a command if a device is connected
  } else {

    try {

      switch (command) {
        // Connect to the USB device
        case 'connect' :
          result = this.connect();
          break;

        // Stop everything the device is doing right now
        case 'read' :

          this.device.write(this.options.read);
          this.device.read(function(error, data) {
            
            // Transform the temperature
            var hiByte = data[2];
            var loByte = data[3];

            var sign = hiByte & (1 << 7);
            var temp = ((hiByte & 0x7F) << 8) | loByte;
            
            if (sign) {
              temp = -temp;
            }

            // Calculate it
            temperature = temp * 125.0 / 32000.0;

            // Send the temperature via callback
            callback(temperature);
          });
          break;

        // The transmitted command is not supported
        default:
          console.error('Command "' + command + '" is not supported.');
          result = this.message.notSupported;
          break;
      }

    } catch (error) {
      
      // Lost connection to the device
      if (error === this.messages.errorNoDevice) {
        this.device = null;
        result = this.messages.notConnected

      } else {
        console.error(error);
      }
    }

  }

  if (temperature != null) {
    result = temperature;
  }

  return result;
};





/**
 * Export the module so that others can use it
 */ 
module.exports = new Temper1Connector();