#include <SoftwareSerial.h>

#include <Wire.h>
#include <LSM303.h>
LSM303 compass;
LSM303::vector<int16_t> running_min = {
  -1383, -2061, -3033}
, running_max = {
  2229, 1974, 1206};

#define triggerZ 8
#define echoZ 9
#define ultrasonic_power 7

SoftwareSerial mySerial(2, 3); // RX, TX
int cx, cy;
unsigned long prevTime= millis();
unsigned long currTime;
unsigned long elapTime;

void setup() {
  Serial.begin(9600);
  mySerial.begin(38400);

  pinMode(triggerZ, OUTPUT);
  pinMode(echoZ, INPUT);
  pinMode(ultrasonic_power, OUTPUT);
  digitalWrite(ultrasonic_power, HIGH);
  Wire.begin();
  compass.init();
  compass.enableDefault();


}
void loop() {
  // if(calc_x() < -50 || calc_x() > 50){
  //   Serial.println(calc_x());
  // }
  // 
  // if(calc_y() < -50 || calc_y() > 50){
  //   Serial.println(calc_y());
  // }
  // 

//  currTime = millis();
//  elapTime = currTime - elapTime;
//  if(elapTime > 100){
//    mySerial.print(calc_x());
//    mySerial.print('\n');
//    mySerial.print(calc_y());
//    mySerial.print('\n');
//    prevTime = millis();
//  }

while(mySerial.available()){
  if(mySerial.read() == 49){
    mySerial.print(calc_x());
    mySerial.print('\n');
    mySerial.print(calc_y());
    mySerial.print('\n');
  }
}  

  
  //  mySerial.print(calc_x());
  //  mySerial.print("\t");
  //  mySerial.print(calc_y());
  //  mySerial.print("\t");
  //  mySerial.println(calc_z());
  //  

}


int calc_x(){
  compass.read();
  int x;
  x = compass.a.y;
  return(map(x, -16500, 16500, -250, 250));
}

int calc_y(){
  compass.read();
  int y;
  y = compass.a.x;
  return(map(y, -16500, 16500, -250, 250));
}

int calc_z() {
  long duration, distance;
  digitalWrite(triggerZ, LOW);  
  delayMicroseconds(2); 
  digitalWrite(triggerZ, HIGH);
  delayMicroseconds(10); 
  digitalWrite(triggerZ, LOW);
  duration = pulseIn(echoZ, HIGH, 12000);
  distance = (duration / 2) / 29.1;
  if (duration >11640){
    distance = 200;
  }
  return (distance);

}

void send_data(){
  mySerial.print(cx);
  mySerial.print(cy);
}


void print_raw(){
  Serial.print(calc_x());
  Serial.print('\t');
  Serial.print(cx);
  Serial.print('\t');
  Serial.print(calc_y());
  Serial.print('\t');
  Serial.println(cy);
}



