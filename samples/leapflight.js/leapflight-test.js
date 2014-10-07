/**
 * leapflight-test
 * This js file does not contain Bluetooth comms, for testing before bringing it over to leapflight.js
 * @author Alvin Ng, James Tan, Jia Jian
 */
var Leap = require('leapjs');


var controller = new Leap.Controller().connect();


controller.on('frame', function() {
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


		/* BEGIN dirty L/R mapping */
		var lr = map(roll).toPrecision(6);
				
		if (lr < 0) {
			//map the Right to -40
			//nerf LR sensing when it is centered
			if (lr > -5 && lr <= 0) {
				lr = 0;
			} else if (lr < 10 && lr >= 0) {
				lr = 0;
			}

			if (lr < -40) lr = -40;

			x = lr / 40.0 * 150.0;
		} else {
			if (lr > 80) lr = 80;
			x = lr / 80.0 * 116.0;
		}

				
		/* END dirty L/R mapping */

		output = -1 * x + "\n" + -1 * y + "\n";

		console.log("LeapMotion> Hand roll: %d deg, pitch: %d deg, yaw: %d deg", roll, pitch, yaw);
		console.log("App> Roll to x: %d, pitch to y: %d\r\n", x, y);
		
		if (roll > 30) {
			console.log("LeapMotion> Direction: Left");
		} else if (roll < -20) {
			console.log("LeapMotion> Direction: Right");
		}

		if (pitch > 30) {
					console.log("LeapMotion> Direction: Backwards");
		} else if (pitch < -30) {
			console.log("LeapMotion> Direction: Forward");
		}
	}
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