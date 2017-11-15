'use strict';

var config  = require('../config.js');

exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');

  console.log('inside Backend hourlyScheduledFunction');
  console.log("This job is ran every hour!");

  return;
};
