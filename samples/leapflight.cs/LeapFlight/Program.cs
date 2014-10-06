using Leap;
using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LeapFlight {
	public class Program {

		public static double map(double value) {
			return value / 180 * 250;
		}

		public static void Main(string[] args) {
			// Init outgoing connection to HC-06 Bluetooth module.
			SerialPort serialPort = new SerialPort();
			serialPort.PortName = "COM13";
			serialPort.BaudRate = 9600;
			serialPort.Open();

			// We can consider auto scanning for the ports? Better UX this way.

			// And so it begins...
			if (serialPort.IsOpen) {
				Console.WriteLine("SerialPort> Yay! Connected to the Arduino. :D");
			}

			Controller controller = new Controller();

			while (serialPort.IsOpen) {

				if (serialPort.BytesToRead > 0) {
					// If our Arduino is ready to receive the drone commands - synchronisation.
					if (serialPort.ReadChar().Equals('1')) {
						Console.WriteLine("SerialPort> Handshaking request received! Should I transmit data over?");

						foreach (Hand hand in controller.Frame().Hands) {
							if (hand.IsLeft) {
								Console.WriteLine("LeapMotion>  Hand id: " + hand.Id
										+ ", palm position: " + hand.PalmPosition);

								// Get the hand's normal vector and direction
								Vector normal = hand.PalmNormal;
								Vector direction = hand.Direction;

								// Calculate the hand's pitch, roll, and yaw angles
								var pitch = direction.Pitch * 180.0f / (float)Math.PI;
								var roll = normal.Roll * 180.0f / (float)Math.PI;
								var yaw = direction.Yaw * 180.0f / (float)Math.PI;

								var x = map(pitch);
								var y = map(roll);

								Console.WriteLine("LeapMotion>  Hand pitch: " + pitch + " degrees, "
											+ "roll: " + roll + " degrees, "
											+ "yaw: " + yaw + " degrees");

								Console.WriteLine("SerialPort> Sending stuff... ");
								serialPort.Write(x.ToString() + "\n" + y.ToString() + "\n");
							}
						}
					}
				}

				Thread.Sleep(150);
			}
		}
	}
}
