String data;
int counter = 0;
int x;
int y;

void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);
  Serial.println("And so it begins...");
}

void loop() {
  Serial1.print(1); // Print to COM14.
  while (Serial1.available()) {
    char c = Serial1.read(); // Receives a single char from the Bluetooth port.
    data.concat(c); // Add the received char to the received buffer.
    
    // But if...
    if (c == '\n') {
      if (counter == 0) {
        x = data.toInt(); // Converts ASCII to int.
        counter = 1; // Alternates to receive y.
        Serial.print("x: " + data);
      } else {
        y = data.toInt();
        counter = 0; // Alternates to receive x.
        Serial.print("y: " + data);
        Serial.println("-- END --");
      }
      
      data = "";
    }
    
  }
  delay(150);
}

