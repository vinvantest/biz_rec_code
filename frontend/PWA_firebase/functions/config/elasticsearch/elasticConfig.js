'use strict';

var elasticsearch = require('elasticsearch');

var auth = 'vintest:test1234';
var port = 20914;
var protocol = 'https';
var log = 'trace';
var hostUrls = [
      'iad1-10914-0.es.objectrocket.com',
      'iad1-10914-1.es.objectrocket.com',
      'iad1-10914-2.es.objectrocket.com',
      'iad1-10914-3.es.objectrocket.com'
    ];
var hosts = hostUrls.map(function(host) {
  return {
    protocol: protocol,
    host: host,
    port: port,
    auth: auth,
    log: log
  };
});

var esClient = new elasticsearch.Client({
  hosts: hosts
});

module.exports = esClient;
