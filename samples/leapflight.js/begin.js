/**
 * Project Leapflight - enabling Leap Motion to control drones via a Bluetooth stack.
 * Part of the IDA Labs drones workshop.
 * @author Jia Jian
 */
var Leap = require('leapjs');
var SerialPort = require('serialport').SerialPort


var controller = new Leap.Controller().connect();
var serialPort = new SerialPort('COM14', {
	baudRate: 9600
}); // this is the openImmediately flag [default is true]


serialPort.on('open', function() {
	console.log('SerialPort> Yay! Connected to the Arduino!');

	serialPort.on('data', function(data) {
		console.log('SerialPort> Handshaking request received. (%s)', data);

		// If incoming data is 1, we'll send the Leap Motion data over.
		if (data == 1) {
			var frame = controller.frame(); // Polls for the latest frame.

			// ...and if our latest frame has data in it, then...
			if (frame.hands.length > 0) {
				var hands = frame.hands;
				var hand  = hands[0]; // Take the first hand.
				
				var output;
				
				var roll	= hand.roll() / Math.PI * 180;
				var pitch	= hand.pitch() / Math.PI * 180;
				var yaw		= hand.yaw() / Math.PI * 180;
				var x		= map(roll).toPrecision(6);
				var y		= map(pitch).toPrecision(6);

				output = x + "\n" + y + "\n";

				console.log("LeapMotion> Hand roll: %d deg, pitch: %d deg, yaw: %d deg", roll, pitch, yaw);
				console.log("App> Roll to x: %d, pitch to y: %d\r\n", x, y);

				serialPort.write(output, function() {
					// drain() will wait until all output data has been transmitted to serial port.
					serialPort.drain(function(error) {
						if (error) console.log("SerialPort> Error while sending data. %s", error);
					})
				});
			}
		}
	});
});

serialPort.on('error', function(error) {
	console.log('SerialPort> Failed to open. ' + error);
});


/**
 * Maps [-180, 180] degrees to [-250, 250] for the Arduino-powered drone.
 * @param value in degrees.
 * @return the mapped value for the drone.
 */
function map(value) {
	//return 250 * Math.cos(0.5 * value * (Math.PI / 180)); // No... wrong situation to use cosine curve?
	return (value / 180) * 250;
}