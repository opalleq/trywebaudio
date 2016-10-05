/**
 * Module dependencies.
 */
var express = require('express');
var httpProxy = require('http-proxy');
var bodyParser = require('body-parser');

var port = +process.argv[2] || 8080;

var proxyOptions = {
  changeOrigin: true,

  ignorePath: true
};

httpProxy.prototype.onError = function (err) {
  console.log(err);
};

var apiProxy = httpProxy.createProxyServer(proxyOptions);

// Node express server setup.
var server = express();

server.set('port', port);
server.use(express.static(__dirname + '/'));

server.use(bodyParser.json());

server.use(bodyParser.urlencoded({
  extended: true
}));

server.all("/download", function(req, res) {
  console.log('Intercepting request');

  console.log(req.query.url);

  apiProxy.web(req, res, {target: req.query.url});
});

// Start Server.
server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});