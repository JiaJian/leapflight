#include <Servo.h>
#define LED 13

Servo AIL;
Servo ELE;
Servo THR;
Servo RUD;
Servo AUX;

int recAIL;
int recELE;
int recTHR;
int recRUD;
int recAUX;

int max_rec;
int min_rec;
int mid_rec;
int ref_aux;
int ele, ail, rud, x,y;

int MILD = 100;
int HARSH = 200;
String data = "";
int xx;
int yy;

int counter = 0;
unsigned long lastTime;
unsigned long currTime;
unsigned long elapTime;

void setup() {

  Serial.begin(9600);
  Serial1.begin(9600);
  pinMode(8, INPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  AIL.attach(9);
  ELE.attach(10);
  THR.attach(11);
  RUD.attach(12);

  recAIL = pulseIn(3, HIGH, 20000);
  for (int i = 0; i < 10; i++) {
    mid_rec += recAIL;
  }
  
  ref_aux = pulseIn(7, HIGH, 20000);
  mid_rec = mid_rec / 10; // average
  min_rec = mid_rec - 450; // minimum value
  max_rec = mid_rec + 450; // maximum value
  //mid_rec = 1500;
  digitalWrite(8, HIGH);
  fakePulse();
  delay(500);
}


void loop() {

  lastTime = micros();
  recAIL = pulseIn(3, HIGH, 20000);
  recELE = pulseIn(4, HIGH, 20000);
  recTHR = pulseIn(5, HIGH, 20000);
  recRUD = pulseIn(6, HIGH, 20000);
  recAUX = pulseIn(7, HIGH, 20000);
  //Keep reading from HC-05 and send to Arduino Serial Monitor
  //Serial.println(recAUX);

  //check if aux switch is flipped. if so trigger auto pilot
  if (recAUX > 0 && recAUX > (ref_aux + 400)){ 
    digitalWrite(LED, HIGH);
    read_wearable();
    rud = mid_rec;
    if (recAIL > mid_rec + 50 || recAIL < mid_rec - 50) {
      ail = recAIL;
    }
    if (recELE > mid_rec + 50 || recELE < mid_rec - 50) {
      ele = recELE;
    }
    if (recRUD > mid_rec + 50 || recRUD < mid_rec - 50) {
      rud = recRUD;
    }
  }
  else{
    //else, pass remote control signals to flight controller
    digitalWrite(LED, LOW);
    ail = recAIL;
    ele = recELE;
    rud = recRUD;
  }
  
  // pass ail, ele, rud signal values from remote control to flight controller
  AIL.writeMicroseconds(ail);
  ELE.writeMicroseconds(ele);
  THR.writeMicroseconds(recTHR);
  RUD.writeMicroseconds(rud);
  //  Serial.print(ail);
  //  Serial.print('\t');
  //  Serial.println(ele);


  //Serial.println(elapTime);
  Serial.print(ail);
  Serial.print('\t');
  Serial.println(ele);

}

void fakePulse() {

  AIL.writeMicroseconds(1500);
  delay(10);
  ELE.writeMicroseconds(1500);
  delay(10);
  THR.writeMicroseconds(1100);
  delay(10);
  RUD.writeMicroseconds(1500);
  delay(10);

}

void read_wearable(){
  
  Serial1.print(1); // For transmitter to synchronise data tx
  
  while (Serial1.available()) {
    char character = Serial1.read(); // Receive a single character from the software serial port
    data.concat(character); // Add the received character to the receive buffer
    if (character == '\n') {
      //Serial.print(data);
      if (counter == 0) {
        xx = data.toInt();
        counter = 1;
      }
      else if (counter == 1) {
        yy = data.toInt();
        counter = 0;
      }

      // Add your code to parse the received line here....

      // Clear receive buffer so we're ready to receive the next line
      data = "";
    }
  }

  if (xx > 50) {
    ail = mid_rec + xx;
  }
  else if (xx < -50) {
    xx = abs(xx);
    ail = mid_rec - xx;
  }
  else if (xx > -50 && xx < 50) {
    ail = mid_rec;
  }

  if (yy > 50){
    ele = mid_rec + yy;
  }
  else if (yy < -50) {
    yy = abs(yy);
    ele = mid_rec - yy;
  }
  else if (yy > -50 && yy < 50) {
    ele = mid_rec;
  }
}
//  switch(x){
//  case 51:
//    ail = mid_rec;
//    break;
//  case 52:
//    ail = mid_rec + MILD;
//    break;
//  case 53:
//    ail = mid_rec + HARSH;
//    break;
//  case 50:
//    ail = mid_rec - MILD;
//    break;
//  case 49:
//    ail = mid_rec - HARSH;
//    break;
//  }
//
//  switch(y){
//  case 51:
//    ele = mid_rec;
//    break;
//  case 52:
//    ele = mid_rec + MILD;
//    break;
//  case 53:
//    ele = mid_rec + HARSH;
//    break;
//  case 50:
//    ele = mid_rec - MILD;
//    break;
//  case 49:
//    ele = mid_rec + HARSH;
//    break;
//  }







