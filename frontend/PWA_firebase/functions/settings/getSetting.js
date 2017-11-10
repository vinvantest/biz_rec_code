'use strict';

var config  = require('../config.js');
var configUser  = require('../config/specific/user_template_columns.js');
var helper = require('../config/helpers/helper.js');
var msgConfig = require('../config/global/messages.js');

function handlePOST (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handleDELETE (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

//https://us-central1-bizrec-dev.cloudfunctions.net/getSettingFunction?uid=HJIOFS#53345DD&settId=HLH343HS52
//no body {} -- settings body
function handleGET (req, res, esClient)
{
  // Do something with the GET request

   console.log('Inside serer.post(getSettings())');
   console.log('req.query.uid = ' + req.query.uid);
   console.log('req.query.settId = ' + req.query.settId);
   var routingUid = req.query.uid;
   var settId = req.query.settId;

   if(routingUid === null || routingUid === undefined) {
    console.log("Error: req.query.routingUid required to create Index in ES ->" + routingUid);
    helper.failure(res,msgConfig.settings_invalid_uid + msgConfig.support_contact,401);
   }
   if(settId === null || settId === undefined) {
    console.log("Error: req.query.settId required to create Index in ES ->" + settId);
    helper.failure(res,msgConfig.settings_invalid_setting_body + msgConfig.support_contact,401);
   }

   esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				helper.failure(res, msgConfig.elastic_cluster_down, 500);
			} else {
				console.log('Elasticsearch Instance on ObjectRocket Connected!');
			}
	});
	//check elasticsearch health
	esClient.cluster.health({},function(err,resp,status) {
		  console.log("-- esClient Health --",resp);
	});

	 console.log('Checking if index Exists('+config.settings_index_name+')');
	 esClient.indices.exists({index: config.settings_index_name})
		 .then(function (error,resp) {
       console.log('error value -' + error);
       console.log('response value - ' + resp);
       if(error)
       {
        console.log('Index ['+config.user_index_name+'] already exists in ElasticSearch. Response is ->'+error);
        //check if UID exists in users index using global_alisas_for_search_users_index
        var queryBodyCheckUserExists = {
             index : config.user_index_search_alias_name,
             type : config.index_base_type,
             body: {
               query: {
                    match: {
                      [configUser.usr_uid] : routingUid
                    }
                  }
             }
        };
        console.log('queryBodyCheckUserExists (JSON) is->'+JSON.stringify(queryBodyCheckUserExists));
        esClient.search(queryBodyCheckUserExists)
          .then(function (respUserCheck) {
            //check hits if there are any user records!
            console.log('hits.total =' + respUserCheck.hits.total);
            if(respUserCheck.hits.total === 0){
              //user doesn't exists
              console.log('User does not exists in user index - '+ JSON.stringify(respUserCheck));
              console.log('Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error);
              helper.failure(res,msgConfig.settings_user_not_exists + msgConfig.support_contact,500);
              }
              else if(respUserCheck.hits.total === 1 ){
                //only one record for the user. Update the user record for the user.uid
                console.log('User exists in user index. Updating now! - '+ JSON.stringify(respUserCheck));
                var hits = respUserCheck.hits.hits;
                console.log('hits object - '+ JSON.stringify(hits[0]));
                //User Uid exists
                // GET settings Data fron settings Index
                var indexAliasName = routingUid+config.settings_alias_token_read;
                console.log('Alias name derived through routing is ->'+indexAliasName);
                var queryBody = {
                  index: indexAliasName,
                  type: config.index_base_type,
                  id: settId
                };
                console.log('queryBody ->' + JSON.stringify(queryBody));
                esClient.get(queryBody)
                .then(function (respSettingsData) {
                    console.log('Setting Data Retrieved Successfully!');
                    helper.success(res,respSettingsData);
                    },
                      function (error) {
                        console.log('Error : setting document read ['+indexAliasName+'] Failed!' + JSON.stringify(error));
                        helper.failure(res,msgConfig.settings_record_retrieve_failed,500);
                    });
                }
              else{
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Too many user records found ['+config.user_index_write_alias_name+']! Duplicate records of the user exists. Conctact System Adminstrator.' + error);
                helper.failure(res,msgConfig.settings_duplicate_records + msgConfig.support_contact,500);
              }
          }, function (error) {
                  console.log('Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error);
                  helper.failure(res,msgConfig.settings_user_not_found + msgConfig.support_contact,500);
              });//End: check user exists
       }//end if
       else {
         //index dosen't exist. Create one.
          console.log('Setting Index does not Exists! Can not get settings data. Error value is ->'+JSON.stringify(err));
          helper.failure(res,msgConfig.settings_user_index_not_exists + msgConfig.support_contact,404);
       } // end else - index doesn't exist
	  });//end then - indices.exists()

}

exports.handler = function(req, res, database, esClient)
{
  var usersRef = database.ref('users');
  switch (req.method) {
  case 'GET':
    handleGET(req, res, esClient);
    break;
  case 'PUT':
    handlePUT(req, res);
    break;
  case 'POST':
      handlePOST(req, res);
      break;
  case 'DELETE':
       handleDELETE(req, res);
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
