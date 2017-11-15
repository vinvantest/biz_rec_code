'use strict';

var config  = require('../config.js');

exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');

  console.log('inside Backend dailyScheduledFunction');
  console.log("This job is ran every day!");

  return;
};
