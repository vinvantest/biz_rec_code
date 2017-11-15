'use strict';

var config  = require('../config.js');

exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');

  console.log('inside Backend weeklyScheduledFunction');
  console.log("This job is ran every week saturday!");

  return;
};
