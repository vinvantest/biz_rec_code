'use strict';

//var esClient = require('./config/elasticsearch/elasticConfig.js');
var config  = require('../config.js');


exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');
  console.log('inside Backend Function2 - databaseTrigger2');
  console.log( 'event data ='+JSON.stringify(event.data.val()) );
  console.log('event.params.uid =' + event.params.uid );

  //if event.data === null then it is delete on node operation.
  //.onWrite gets called only once due to .set on node DB in landing-page.html

  return;
};
