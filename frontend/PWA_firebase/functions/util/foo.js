'use strict';

var config  = require('../config.js');
var banksTemplate = require('../config/templates/banks_template.js');

function handleGET (req, res) {
  // Do something with the GET request
  console.log('config variable is ->'+JSON.stringify(config));
  res.status(200).send('Hello World! ... foo ran successfully config[' + config.consumer_key + '] banks['+JSON.stringify(banksTemplate));
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

exports.handler = function(req, res, database) {
      // Use database to declare databaseRefs:
      var usersRef = database.ref('users');
      switch (req.method) {
      case 'GET':
        handleGET(req, res);
        break;
      case 'PUT':
        handlePUT(req, res);
        break;
      default:
        res.status(500).send({ error: 'Something blew up!' });
        break;
      }
   };
