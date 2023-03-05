#!/usr/bin/nodejs

// -------------- load packages -------------- //
// INITIALIZATION STUFF

var express = require('express')
var app = express();
const axios = require("axios");
const https = require("https");
app.set('view engine','ejs')

app.use(
    express.static('static_files')
)


var options = {
  'headers': {
    'User-Agent': 'request'
  }
}

app.get('/process_address', function(req, res) {
  var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.query.lat + "," + req.query.long + "&key=AIzaSyB2Zypx1mmpCXLKUvScZD4vvhZup5otZxo"
  https.get(url, options, function(response) {
    let data = '';
    response.on('data', function(chunk) {
      data = data + chunk
    });

    response.on('end', function() {
      data = JSON.parse(data)
      let addy = data.results[1].formatted_address
      res.json({'address' : String(addy)})
    });
  }).on('error', function(e) {
    console.error(e);
  })
});

app.get('/request', function(req, res) {
    let lat = parseFloat(req.query.lat);
    let long = parseFloat(req.query.long);
    let tempurl = "https://next-parking-lot.p.rapidapi.com/location/";
    tempurl += String(lat-0.02) + "/" + String(lat + 0.02) + "/" + String(long-0.02) + "/" + String(long+0.02) + "/14";
    const options = {
      method: 'GET',
      //url: 'https://next-parking-lot.p.rapidapi.com/location/38.921085/38.922839/-77.231392/-77.235104/14',
      url : tempurl,
      headers: {
        'X-RapidAPI-Key': 'bad3ad893fmsh136f299700e83aap17f8c0jsnacce62fdcd7b',
        'X-RapidAPI-Host': 'next-parking-lot.p.rapidapi.com'
      }
    };

    let out = {
        'lat' : [],
        'long' : [],
    }
    
    axios.request(options).then(function (response) {
        	let nodes = response.data.Nodes;
        	for (let i = 0; i < nodes.length; i++)
        	{
        	    out.lat.push(nodes[i].Latitude);
        	    out.long.push(nodes[i].Longitude);
        	}

        	
        	res.json(out);
        }).catch(function (error) {
        	console.error(error);
    });
});


app.get('/', function(req, res) {
   res.render('home') 
});

app.get('/parkit', function(req, res) {
   res.render('parkit') 
});

app.get('/about', function(req, res) {
   res.render('about') 
});

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});