const http = require('http');
const dotenv = require('dotenv');
const twitter = require('./twitter');

dotenv.config();

const hostname = '127.0.0.1';
const port = 3000;

var params = {screen_name: 'nodejs'};

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  twitter.getSearch(params);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
