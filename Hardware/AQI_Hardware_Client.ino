
/* Including the SDK and WiFi header */
#include <Grandeur.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <SoftwareSerial.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <NTPClient.h>
#include "time.h"
#include "CO2Sensor.h"
#include "DHT.h"
#include "MQ131.h"  
#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
#define MAX_COUNT 5

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 18000;   //Replace with your GMT offset (seconds)
const int   daylightOffset_sec = 0;  //Replace with your daylight offset (seconds)

// DHT Sensor
uint8_t DHTPin = 0; 
               
// Initialize DHT sensor.
DHT dht(DHTPin, DHTTYPE);                

float Temperature;
float Humidity;

CO2Sensor co2Sensor(A0, 0.99, 100);
int co2_values[] = {0,0,0,0,0};

/* Configurations */
String deviceID = "YOUR-DEVICE-ID";
String apiKey = "YOUR-API-KEY";
String token = "YOUR-ACCESS-TOKEN";

/* WiFi credentials */
String ssid = "YOUR-WIFI-SSID";
String password = "YOUR-WIFI-PASSWORD";

/* Create variable to hold project and device */
Grandeur::Project project;
Grandeur::Project::Device device;
Grandeur::Project::Datastore datastore;

/* Variable to store time reference */
unsigned long current;

/* Connection status and device state */
int connected = false;
double state = 0;

/* Function to check device's connection status */
void onConnection(bool status) {
  switch (status) {
    case CONNECTED:
      /* Device connected to the cloud */
      connected = true;

      /*
          Takes a snapshot of time
          for timer
      */
      current = millis();

      return;

    case DISCONNECTED:
      /* Device disconnected from cloud */
      connected = false;

      return;
  }
}

/* Function to handle update in device state */
void handleUpdate(const char* code, Var payload) {
  /* Get state */
  double newState = (double) payload["data"];
  newState = 200232;

  /* Print if got an update */
  if (newState != state) {
    /* Update state */
    state = newState;

    /* Print */
    Serial.println(state);
  }
}

void insertHandleUpdate(const char* code, Var payload) {
  /* Get state */
 
    /* Print */
    Serial.println(code);
     //Serial.println(payload["documents"]);
}

int movingAverageCO2Value(int co2_instant_value){

    co2_values[MAX_COUNT-1] = co2_instant_value;

    for (byte i =0; i < (MAX_COUNT-1); i++){
      co2_values[i%MAX_COUNT] = co2_values[(i+1)%MAX_COUNT];
    }
    
    for (byte i = 0; i < (MAX_COUNT-1); i++){
         co2_values[MAX_COUNT-1] += co2_values[i];
    }
  return co2_values[MAX_COUNT-1]/MAX_COUNT;
  
}


String printLocalTime()
    {
          time_t rawtime;
          char s[20];
          struct tm * timeinfo;
          time (&rawtime);
          timeinfo = localtime (&rawtime);
          strftime(s,sizeof(s),"%T %d/%m/%Y", timeinfo);
          delay(1000);
          return s;
    }

/* Function to connect to WiFi */
void connectWiFi() {
  /* Set mode to station */
  WiFi.mode(WIFI_STA);

  /* Connect using the ssid and password */
  WiFi.begin(ssid, password);

  /* Block till WiFi connected */
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  /* Connected to WiFi so print message */
  Serial.println("");
  Serial.println("WiFi connected");

  /* and IP address */
  Serial.println(WiFi.localIP());
}

/* In setup */
void setup() {

    
  /* Begin the serial */
    Serial.begin(115200);
    delay(100);
    //init and get the time
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    printLocalTime();
    

  /* Connect to WiFi */
  connectWiFi();

  /* Initializes the global object "grandeur" with your configurations. */
  project = grandeur.init(apiKey, token);

  /* Get reference to device */
  device = project.device(deviceID);
  datastore = project.datastore();

  /* Sets connection state update handler */
  project.onConnection(onConnection);



      //==========================O3 Sensor Setup============================
        
      
      // Init the sensor
      // - Heater control on pin 2
      // - Sensor analog read on pin A0
      // - Model LOW_CONCENTRATION
      // - Load resistance RL of 1MOhms (1000000 Ohms)
      MQ131.begin(16,A0, LOW_CONCENTRATION, 1000000);  
      Serial.println("Calibration in progress...");
      MQ131.calibrate();
      Serial.println("Calibration done!");
      Serial.print("R0 = ");
      Serial.print(MQ131.getR0());
      Serial.println(" Ohms");
      Serial.print("Time to heat = ");
      Serial.print(MQ131.getTimeToRead());
      Serial.println(" s");
    
     //=================================================
    
    
      //=========================DHT22 Setup=========================
      
      pinMode(DHTPin, INPUT);
      dht.begin();
      //==============================================  

      //========================MG811 CO2 Sensor=====
        co2Sensor.calibrate();
        delay(5000);

}

/* Loop function */
void loop() {
  /* Checks device connection status */
  if (connected) {
    /*
        If device is connected to the cloud
    */
    if (millis() - current >= 5000) {
      /* Code in this if-block runs after every 5 seconds
      */
      Serial.println("Checking for Update...");
      Temperature = dht.readTemperature(); // Gets the values of the temperature
      Humidity = dht.readHumidity(); // Gets the values of the humidity 
      MQ131.sample();
      String time_str = printLocalTime();

      Var jsonData;
      jsonData[0]["timestamp"] = time_str;
      jsonData[0]["temperature"] = Temperature;
      jsonData[0]["humidity"] = Humidity;
      jsonData[0]["ozone_ppm"] = MQ131.getO3(PPM);
      jsonData[0]["ozone_ppb"] = MQ131.getO3(PPB);
      jsonData[0]["ozone_mg_m3"] =  MQ131.getO3(MG_M3);
      jsonData[0]["ozone_ug_m3"] =  MQ131.getO3(UG_M3);
      jsonData[0]["co2_ppm"] = movingAverageCO2Value(co2Sensor.read());      
      datastore.collection("Sensors").insert(jsonData, insertHandleUpdate);

      /* Updates *current* variable */
      current = millis();
    }
  }

  /* Synchronizes the SDK with the cloud */
  project.loop(WiFi.status() == WL_CONNECTED);
}
