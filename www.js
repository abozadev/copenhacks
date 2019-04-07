'use strict';

require('dotenv').config();
let express = require('express');
let app = express();
let path = require("path");
var twitter = require("./twitter");

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

// Start the server
let configPort = process.env.PORT;
let port = (configPort !== undefined ? configPort : 3000);
let server = app.listen(port, function () {
    console.log('Listening on port ' + server.address().port);
});

app.get('/XXXX', function(req, callback){
  callback.send('OK')
});

app.get('/search/:q', function(req, callback) {
	var params = {q: req.params.q}
		twitter.getSearch(params, callback);
})

app.get('/user/:username', function(req, callback) {
	var params = {screen_name: req.params.username}
		twitter.getUserTweets(params, callback);
})


app.get('/topics/:username', function(req, callback) {
	var params = {screen_name: req.params.username}
		twitter.getUserTweetsTopics(params, callback);
})

const request = require('request');

const credentials = process.env.TWITTER_CONSUMER_KEY  + ':' + process.env.TWITTER_CONSUMER_SECRET;
const credentialsBase64Encoded = new Buffer(credentials).toString('base64');

let TOKEN = null;

request({
    url: 'https://api.twitter.com/oauth2/token',
    method:'POST',
    headers: {
      'Authorization': 'Basic ' + credentialsBase64Encoded,
      'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: 'grant_type=client_credentials'
}, function(err, resp, body) {
    TOKEN = JSON.parse(body).access_token;
})

app.get('/user/info/:username', function(req, callback) {
	var params = {token: TOKEN, screen_name: req.params.username};
	twitter.getUserInfo(params, callback);
})
