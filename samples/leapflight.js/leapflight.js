/**
 * Project Leapflight - enabling Leap Motion to control drones via a Bluetooth stack.
 * Part of the IDA Labs drones workshop.
 * @author IDA Labs
 */
var Leap = require('leapjs');
var SerialPort = require('serialport').SerialPort;


var controller = new Leap.Controller().connect();
var serialPort = new SerialPort('COM13', {
	baudRate: 9600
});


serialPort.on('open', function() {
	console.log('SerialPort> Yay! Connected to the Arduino!');

	serialPort.on('data', function(data) {
		console.log('SerialPort> Handshaking request received. (%s)', data);


		// If incoming data is 1, we'll send the Leap Motion data over.
		if (data == 1) {
			var frame = controller.frame(); // Polls for the latest frame.
			//var output = "0x0y0z";
			var output = "0\n0\n";

			// ...and if our latest frame has data in it, then...
			if (frame.hands.length > 0) {
				var hands = frame.hands;
				var hand  = hands[0]; // Take the first hand.
				
				var output;
				
				var roll	= hand.roll() / Math.PI * 180;
				var pitch	= hand.pitch() / Math.PI * 180;
				var yaw		= hand.yaw() / Math.PI * 180;
				var x		= -1 * mapLR(roll, hand.type).toPrecision(6);
				var y		= -1 * mapFB(pitch, hand.type).toPrecision(6);


				console.log("LeapMotion> I'm %d% confident of the readings.", hand.confidence * 100);
				if (hand.confidence < 0.25) console.log("LeapMotion> WARNING! I'm really not sure about the readings below...");
				console.log("LeapMotion> Hand roll: %d deg, pitch: %d deg, yaw: %d deg (original values)", roll, pitch, yaw);
				console.log("LeapMotion> %s hand detected.", hand.type)
				console.log("App> Roll to drone x: %d, pitch to drone y: %d\r\n", x, y);

				if (hand.confidence >= 0.25) {
					if (x < -50 || x > 50) {
						output = x + "\n" + "0\n";
					}
					else if (y < -20 || y > 20 ) {
						output = "0\n" + y + "\n";
					}
					else {
						output = x + "\n" + y + "\n"; // If it's in the safe range, just send everything. (?)
					}
				}
			}

			console.log("SerialPort> Sending data over: \"%s\"", output.replace(/\\/g, "\\"));
			serialPort.write(output, function() {
				// drain() will wait until all output data has been transmitted to serial port.
				serialPort.drain(function(error) {
					if (error) console.log("SerialPort> Error while sending data. %s", error);
				})
			});
		}
	});
});

serialPort.on('error', function(error) {
	console.log('SerialPort> Failed to open. ' + error);
});


/**
 * Scale [-180, 180] degrees to [-250, 250] for the Arduino-powered drone.
 * @param value in degrees.
 * @return the mapped value for the drone.
 */
function scale(value) {
	return (value / 180) * 250;
}

/**
 * Maps the rotation about the z-axis (i.e. [-180, 180] degrees) to the drone's aileron (i.e. [-250, 250]).
 * @param value in degrees.
 * @param handType either left or right.
 * @return the mapped value for the drone.
 */
function mapLR(value, handType) {
	if (handType == "left") {
		// Compensate right side for being a left-hander.
		if (value < 0) {
			if ( ((value / 135) * 250) < -250) {
				return -250;
			}
			else {
				return (value / 130) * 250;
			}
		}

		return (value / 180) * 250;
	}
	else if(handType == "right") {
		// Compensate left side for being a right-hander.
		if (value > 0) {
			if ( ((value / 135) * 250) > 250) {
				return 250;
			}
			else {
				return (value / 130) * 250;
			}
		}

		return (value / 180) * 250;
	}
}

/**
 * Maps the rotation about the x-axis (limited to [-80, 80] degrees) to the drone's elevation (i.e. [-250, 250]).
 * @param value in degrees.
 * @param handType either left or right.
 * @return the mapped value for the drone.
 */
function mapFB(value, handType) {
	if (handType == "left") {
		if (value > 80) {
			return 80;
		}
		else if (value < -80) {
			return -80;
		}
		else {
			return (value / 130) * 250; // Limit the upper bound to +/-80/130, even lower to 235 (just an experimentation).
		}
	}
	else if (handType == "right") {
		return 0; // TODO: Implement for the right hand!
	}
}