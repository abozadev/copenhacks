'use strict';

require('dotenv').config();
let express = require('express');
let app = express();
let path = require("path");

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
