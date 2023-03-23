console.log("index.js: début");
const http = require('http');


var adresse_mac_du_module_bluetooth = '98:D3:B1:FD:90:40'
var adresse_ip_et_port_du_serveur = 'http://192.168.1.52:3000';
var x_etat = 0 ;
var x_temperature = 0;


var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

btSerial.on('data', function(buffer)
{
  var donnees_recues = buffer.toString('utf-8');

  if(donnees_recues!='X'&& !isNaN(donnees_recues.substring(2,7))&&((donnees_recues.substring(0,1)==0 )||(donnees_recues.substring(0,1)==1)))
  {
    envoyerMessagesRaspiArdui("received");

    x_etat = parseInt(donnees_recues.substring(0,1));
    x_temperature = parseFloat(donnees_recues.substring(2,7));

    console.log('btSerial.on(data):  X_ETAT = ',x_etat," -  X_temperature = ",x_temperature);

    envoyerHTTP(x_etat, x_temperature);
  }
});


btSerial.on('closed', function()
{
  console.log('btSerial.on(closed): début');
  console.log('btSerial.on(closed): la connection au périphérique Bluetooth a été fermée.');
});


btSerial.on('failure', function(err)
{
  console.log('btSerial.on(failure): début');
  console.log('btSerial.on(failure): err = ' + err);
  console.log('btSerial.on(failure): err = ');
  console.log(err);
});


btSerial.on('found', function(address, name)
{
	console.log('btSerial.on(found): début');
	console.log('btSerial.on(found): adress = ' + address + '  - name = ' + name);
	if (address == adresse_mac_du_module_bluetooth)
        {
            console.log('btSerial.on(found): l\'adresse du périphérique Bluetooth trouvé est celle du périphérique Bluetooth que l\'on cherche.');
	    btSerial.findSerialPortChannel(address, function(channel)
            {
                console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): début');
                console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): adress = ' + address + ' - name = ' + name + ' - channel = ' + channel);
                console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): un port série a été trouvé : channel = ' + channel);
	        btSerial.connect(address, channel, function()
                {
			console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): btSerial.connect().successCallback(): début');
			console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): btSerial.connect().successCallback(): la connexion est établie, on peut maintenant envoyer des messages.');
                 }, function ()
                              {
				console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): btSerial.connect().errorCallback(): début');
				console.log('btSerial.on(found): btSerial.findSerialPortChannel().successCallback(): btSerial.connect().errorCallback(): la connection n\'a pas pu être établie.');
			      });
	       	}, function() {
                        console.log('btSerial.on(found): btSerial.findSerialPortChannel().errorCallback(): début');
			console.log('btSerial.on(found): btSerial.findSerialPortChannel().errorCallback(): aucun port série n\'a été trouvé.');
		              });
         }
	else
        {
             console.log('btSerial.on(found): l\'adresse du périphérique Bluetooth trouvé n\'est pas celle du périphérique Bluetooth que l\'on cherche.');
	}
});

btSerial.on('finished', function()
{
    console.log('btSerial.on(finished): début');
    console.log('btSerial.on(finished): la recherche de périphérique Bluetooth est terminée.');
});


btSerial.inquire();


if(btSerial.isOpen())
{
  btSerial.write(new Buffer("Hello", 'utf-8'), function(err, bytesWritten)
  {
    console.log('btSerial.write(): début envoie message');
    if (err)
    {
      console.log('btSerial.write(): il y a une erreur : err = ' + err);
      console.log('btSerial.write(): err = ');
      console.log(err);
    }
    else
    {
      console.log('btSerial.write(): il n\'y a pas eu d\'erreur, le buffer a bien été envoyé au périphérique Bluetooth.');
      console.log('btSerial.write(): bytesWritten = ' + bytesWritten);
      console.log('btSerial.write(): bytesWritten = ');
      console.log(bytesWritten);
    }
  });
}

// On lance un petit serveur qui va écouter les requêtes entrantes sur certains liens que l'on va définir
const express = require('express');
const app = express();

//  Quand quelqu'un va appeller le lien "/", on lui répondra "Hello World!"
app.get('/', function (req, res)
{
  console.log('app.get(/).callback(): début');
  console.log('app.get(/).callback(): quelqu\'un a appellé le lien "/"');
  res.send('Hello World!');
})

// On demande à notre serveur d'écouter sur le port 3000
app.listen(3000, function ()
{
  console.log('app.listen().callback(): début');
  console.log('app.listen().callback(): notre serveur écoute les requêtes entrantes...');
})


app.get('/data', function(req,res)
{
	res.send("ETAT_LED : " + x_etat.toString() + "  Temperature : " + x_temperature.toString());
});

app.get('/callback', function(req,res)
{
	//req.send("c'est bon de mon cote");
	x_control = req.query['x_control'];
	console.log('Controle = ' +  x_control);
	envoyerMessagesRaspiArdui(x_control);
});
// Pour envoyer une requête HTTP, c'est comme ça :

function envoyerHTTP(x_etat,x_temperature)
{
	http.get('http:\/\/192.168.1.1:8080/callback?x_etat=' + x_etat + '&x_temperature='+ x_temperature + "" , function(response) {
  		//console.log('traiter_message_recu(): http.get().callback(): début');
  		//console.log('traiter_message_recu(): http.get().callback(): response = ' + response);
  		//console.log('traiter_message_recu(): http.get().callback(): response = ');
  		//console.log(response);
		console.log("Envoi HTTP Succes");
	}).on('error', function(error) {
  		//console.log('traiter_message_recu(): http.get().errorCallback(): début');
  		//console.log('traiter_message_recu(): http.get().errorCallback(): une erreur s\'est produite lors de la requête HTTP.');
  		//console.log('traiter_message_recu(): http.get().errorCallback(): error.message = ' + error.message);
		//console.log('traiter_message_recu(): http.get().errorCallback(): message d\'erreur complet : error = ');
  		//console.log(error);
		console.log("Envoi HTTP Echoue");
});
}



function envoyerMessagesRaspiArdui(msg)
{
  btSerial.write(new Buffer(msg,'utf-8'),function(err,bytesWritten){
    if(err) console.log(err);
    });
}


console.log("index.js: fin");
