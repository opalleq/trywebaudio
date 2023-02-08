/**
 * Module dependencies.
 */
const express = require('express');
const httpProxy = require('http-proxy');
const bodyParser = require('body-parser');

const port = +process.argv[2] || 8080;

const proxyOptions = {
  changeOrigin: true,
  ignorePath: true
};

httpProxy.prototype.onError = function(err) {
  console.log(err);
};

const apiProxy = httpProxy.createProxyServer(proxyOptions);

// Node express server setup
const server = express();
server.set('port', port);
server.use(express.static(__dirname + '/'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));

server.all("/download", function(req, res) {
  console.log('Intercepting request', req.query.url);
  apiProxy.web(req, res, {target: req.query.url});
});

// Start Server
server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});