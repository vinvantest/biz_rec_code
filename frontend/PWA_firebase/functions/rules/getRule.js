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

//https://us-central1-bizrec-dev.cloudfunctions.net/getRuleFunction?uid=HJIOFS#53345DD&ruleId=HLH343HS52
//no body {} -- rules body
function handleGET (req, res, esClient)
{
  // Do something with the GET request
   console.log('Inside serer.post(getrules())');
   console.log('req.query.uid = ' + req.query.uid);
   console.log('req.query.ruleId = ' + req.query.ruleId);
   var routingUid = req.query.uid;
   var ruleId = req.query.ruleId;

   if(routingUid === null || routingUid === undefined) {
    console.log("Error: req.query.routingUid required to create Index in ES ->" + routingUid);
    helper.failure(res,msgConfig.rules_invalid_uid + msgConfig.support_contact,401);
   }
   if(ruleId === null || ruleId === undefined) {
    console.log("Error: req.query.ruleId required to create Index in ES ->" + ruleId);
    helper.failure(res,msgConfig.rules_invalid_rule_body + msgConfig.support_contact,401);
   }

   esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				helper.failure(res, msgConfig.elastic_cluster_down, 500);
			} else {
				console.log('Elasticsearch Instance on ObjectRocket Connected!');
			}
			// on finish
			//esClient.close();
	});
	//check elasticsearch health
	esClient.cluster.health({},function(err,resp,status) {
		  console.log("-- esClient Health --",resp);
	});

	 console.log('Checking if index Exists('+config.rules_index_name+')');
	 esClient.indices.exists({index: config.rules_index_name})
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
        //Note esClient.get() require index, type, and id of the documdnt. If id known then no issues. here we are
        //seaching based on uid parameter of the user object. not its ES id. hence .get() dosen't work
        //If used, it will create duplicate records.
        //esClient.get(queryBodyCheckUserExists)
        esClient.search(queryBodyCheckUserExists)
          .then(function (respUserCheck) {
            //check hits if there are any user records!
            console.log('hits.total =' + respUserCheck.hits.total);
            if(respUserCheck.hits.total === 0){
              //user doesn't exists
              console.log('User does not exists in user index - '+ JSON.stringify(respUserCheck));
              console.log('Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error);
              helper.failure(res,msgConfig.rules_user_not_found + msgConfig.support_contact,500);
              }
              else if(respUserCheck.hits.total === 1 ){
                //only one record for the user. Update the user record for the user.uid
                console.log('User exists in user index. Updating now! - '+ JSON.stringify(respUserCheck));
                var hits = respUserCheck.hits.hits;
                console.log('hits object - '+ JSON.stringify(hits[0]));
                //User Uid exists
                // GET rules Data fron rules Index
                var indexAliasName = routingUid+config.rules_alias_token_read;
                console.log('Alias name derived through routing is ->'+indexAliasName);
                var queryBody = {
                  index: indexAliasName,
                  type: config.index_base_type,
                  id: ruleId
                };
                console.log('queryBody ->' + JSON.stringify(queryBody));
                esClient.get(queryBody)
                .then(function (respRuleBody) {
                    console.log('rules Data Retrieved Successfully!');
                    helper.success(res,respRuleBody);
                    },
                      function (error) {
                        console.log('Error : rules document read ['+indexAliasName+'] Failed!' + JSON.stringify(error));
                        helper.failure(res,msgConfig.rules_record_retrieve_failed,500);
                    });
                }
              else{
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Too many user records found ['+config.user_index_write_alias_name+']! Duplicate records of the user exists. Conctact System Adminstrator.' + error);
                helper.failure(res,msgConfig.rules_duplicate_records + msgConfig.support_contact,500);
              }
          }, function (error) {
                  console.log('Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error);
                  helper.failure(res,msgConfig.rules_user_not_exists + msgConfig.support_contact,500);
              });//End: check user exists
       }//end if
       else {
         //index dosen't exist. Create one.
          console.log('Rule Index does not Exists! Can not get rules data. Error value is ->'+JSON.stringify(err));
          helper.failure(res,msgConfig.rules_user_index_not_exists + msgConfig.support_contact,404);
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
