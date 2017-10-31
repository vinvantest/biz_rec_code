'use strict';

//var esClient = require('./config/elasticsearch/elasticConfig.js');
var config  = require('./config.js');


exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');
  console.log('inside Backend Function1 - databaseTrigger1');
  console.log( 'event data ='+JSON.stringify(event.data.val()) );
  console.log('event.params.uid =' + event.params.uid );

  //if event.data === null then it is delete on node operation.

  return;
};
