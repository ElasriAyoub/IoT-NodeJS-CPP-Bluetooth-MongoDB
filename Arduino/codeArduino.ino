#include <SoftwareSerial.h>
const int temp=A1;
float tempValue = 0;
SoftwareSerial mavoieserie(3, 4);
char character;
char buffer[50];
int state = 0;
const int LED = 11;
char str_temp[6];
int cpt=0;

void setup() 
{
    pinMode(LED, OUTPUT);
    Serial.begin(9600);
    mavoieserie.begin(9600);
}

void loop() {
    float valeur_brute = analogRead(A1) / 1023.0;
    tempValue = valeur_brute *190.0 ;
    if(tempValue > 30)
    {
      state = 1;
      dtostrf(tempValue,4,2,str_temp); // Convertir float en C-String
      sprintf(buffer, "X%d-%s", state, str_temp);
      mavoieserie.write(buffer);
    }
    else
    {
      state = 0;
      dtostrf(tempValue,4,2,str_temp);
      sprintf(buffer, "X%d-%s",state,str_temp);
      mavoieserie.write(buffer);
    }
    Serial.println(buffer);
    delay(1000);

    while (mavoieserie.available()) 
    {
      character = mavoieserie.read();
      if(character == '1')
      {
        ledON();
        state=1;
        Serial.print(character);?
      }
      if(character == '0')
      {
        ledOFF();
        state=0;
        Serial.print(character);
      }
     /* if(cpt=0)
      { 
        cpt++;
        Serial.print("caractere recu : ");
      }*/
      
    }
    Serial.println();
    cpt=0;
}

void ledON()
{
  digitalWrite(LED, HIGH);
}

void ledOFF()
{
  digitalWrite(LED, LOW);
}
