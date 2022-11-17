console.log('index.js: début');

const http = require('http');

var lien_d_envoie_de_message_bluetooth_du_raspberry = 'http://192.168.1.51:3000';

// ------------------------------------------------------------------------------------------
// DEBUT MongoDB
// ------------------------------------------------------------------------------------------
// On importe la librairie "mongoose" qui permet de se connecter à notre base de données MongoDB
var mongoose = require('mongoose');

// On se connecte à MongoDB
var lien_mongoDB = 'mongodb://127.0.0.1/tp_objet_connecte';
mongoose.connect(lien_mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Définition d'un Schema / d'une collection
var Schema = mongoose.Schema;

var TableDesDonnees = new Schema({
    x_temperature: Number,
    x_etat: Boolean,
    x_date : String
});

var TableDesDonnees = mongoose.model('TableDesDonnees', TableDesDonnees);


// Créer une nouvel instance
/*

var nouvelle_donnee = new TableDesDonnees({x_temperature: '25' , x_etat: '1' });
// Enregistrer le nouvel utilisateur dans la base de données MongoDB
nouvelle_donnee.save(function (err) {
    if (err) return handleError(err);
    // saved!
});*/


// ------------------------------------------------------------------------------------------
// FIN MongoDB
// ------------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------------------
// DEBUT communication HTTP
// ------------------------------------------------------------------------------------------



// Voici comment envoyer et écouter des requêtes HTTP, ce qui nous permettra de communiquer avec d'autres appareils sur le réseau

// On lance un petit serveur qui va écouter les requêtes entrantes sur certains liens que l'on va définir


var express = require('express');
var app = express();
var temperature = 0;
var etat = false;




// set the view engine to ejs
app.set('view engine', 'ejs');

// Tous les fichiers qui seront dans le dossier /public seront directement accessible
// Par exemple, si il y a un fichier image.jpeg dans notre dossier public, il sera accessible via le lien /image.jpeg
app.use('/', express.static('public'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

// Quand quelqu'un appellera le lien "/", on exécute ce qui suit
app.get('/home', function(req, res) {
  var x_tableau_donnees= [];

  // On rend le fichier "index.ejs" qui se trouve dans le dossier "views"
  // Les fichiers .ejs sont enfaite des fichiers qui seront exécuté par ce qu'on appelle un moteur de template
  // Un moteur de template permet d'insérer des variables et de manipuler notre page HTML avant de l'envoyer à l'utilisateur
  // Grâce à ça, on va pouvoir facilement faire des boucles, des conditions...etc dans notre HTML
  // Vous pouvez y écrire du HTML classique, EJS rajoute simplement quelques syntaxes dont vous trouverez des exemples dans le fichier views/index.ejs
  TableDesDonnees.find({},function (err, donnes) {
      res.render('index.ejs', {
        x_temperature: temperature,
        x_etat : etat,
        x_tableau_donnees : donnes
      });
  }).sort({date: -1}).limit(100);
});

// Quand quelqu'un appellera le lien "/callback", on exécute ce qui suit
app.get('/callback', function (req, res) {
  res.send('C est bon');

  temperature = req.query['x_temperature'];
  etat = req.query['x_etat'];
  let current_date = new Date(Date.now());

  //let formatted_current_date = current_date.getDay() + current_date.get

  // Afficher les données sur la console de l'API : 
  console.log ("x_temperature : "+ temperature + " x_etat : "+ etat + " x_date : " +current_date);
 
  var new_file = new TableDesDonnees({
    x_temperature : temperature,
    x_etat : etat,
    x_date : current_date
  })
  new_file.save(function (err){
    if (err) return handleError(err);
  })
});


// On créé le serveur qui va écouter toutes ces routes
const server = require('http').createServer(app);


/*

// Pour utiliser Socket.io (Partie 7 du TP), c'est comme ça :
// On créér le websocket
const io = require('socket.io')(server);

io.on('connection', socket => {
  console.log('connexion établie')
  
  // socket.emit() permet d'envoyer un message au navigateur
  let counter = 0;
  setInterval(() => {
    // socket.emit() permet d'envoyer un message au navigateur
    socket.emit('hello', ++counter);
  }, 1000);
  
  // socket.on() permet de définir ce que l'on fait lorsque l'on reçoit un message du navigateur
  socket.on('hey', data => {
    console.log('hey', data);
  });
});*/


// On demande à notre serveur d'écouter sur le port 8080
server.listen(8080, () => {
    console.log('server.listen(8080)');
});
// ------------------------------------------------------------------------------------------
// FIN communication HTTP
// ------------------------------------------------------------------------------------------

console.log('index.js: fin');


//Envoyer une commande pour controler la LED : 

app.get('/AllumerLed',function(req,res){
  console.log("AllumerLed est bien appellée");

  http.get("http://192.168.1.51:3000/callback?x_control=" + "1" + "", function(response) {
    console.log("ENVOI SUCCES");
    }).on('error', function(error) {
      console.log("ENVOI ECHOUE");
    });

    res.send('C est bon');
})

app.get('/EteindreLed',function(req,res){
  console.log("EteindreLed est bien appellée");
  http.get("http://192.168.1.51:3000/callback?x_control=" + "0" + "", function(response) {
    console.log("ENVOI SUCCES");
    }).on('error', function(error) {
      console.log("ENVOI ECHOUE");
    });
    res.send('C est bon');
})




