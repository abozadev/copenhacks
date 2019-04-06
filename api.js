const http = require('http');
const dotenv = require('dotenv');
const twitter = require('./twitter');

dotenv.config();

const hostname = '127.0.0.1';
const port = 3000;



const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

var params = {q: 'nodejs'};

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  twitter.getSearch(function(res) {
    console.log(res);
  }, params);
});
