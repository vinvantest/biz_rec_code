'use strict';

//var esClient = require('./config/elasticsearch/elasticConfig.js');
var config  = require('../config.js');

exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');

  console.log('inside Backend testCronJob');
  console.log("This job is ran every hour!");
  console.log( 'event data ='+JSON.stringify(event.data.val()) );

  return;
};
