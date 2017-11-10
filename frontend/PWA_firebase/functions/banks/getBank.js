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

//https://us-central1-bizrec-dev.cloudfunctions.net/getBankFunction?uid=HJIOFS#53345DD&bankId=HLH343HS52
//no body {} -- banks body
function handleGET (req, res, esClient)
{
  // Do something with the GET request

   console.log('Inside serer.post(getbanks)');
   console.log('req.query.uid = ' + req.query.uid);
   console.log('req.query.bankId = ' + req.query.bankId);
   var routingUid = req.query.uid;
   var bankId = req.query.bankId;

   if(routingUid === null || routingUid === undefined) {
    console.log("Error: req.query.routingUid required to create Index in ES ->" + routingUid);
    helper.failure(res,msgConfig.banks_invalid_uid + msgConfig.support_contact,401);
   }
   if(bankId === null || bankId === undefined) {
    console.log("Error: req.query.bankId required to create Index in ES ->" + bankId);
    helper.failure(res,msgConfig.banks_invalid_bank_body + msgConfig.support_contact,401);
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

	 console.log('Checking if index Exists('+config.banks_index_name+')');
	 esClient.indices.exists({index: config.banks_index_name})
		 .then(function (error,resp) {
       console.log('error value -' + error);
       console.log('response value - ' + resp);
       if(error)
       {
        console.log('Index ['+config.user_index_name+'] already exists in ElasticSearch. Response is ->'+error);
        //check if uid exists
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
              console.log('User does not exists in user index. Creating now! - '+ JSON.stringify(respUserCheck));
              helper.failure(res,msgConfig.banks_user_not_found + msgConfig.support_contact,500);
              }
              else if(respUserCheck.hits.total === 1 ){
                //only one record for the user. Update the user record for the user.uid
                console.log('User exists in user index - '+ JSON.stringify(respUserCheck));
                var hits = respUserCheck.hits.hits;
                console.log('hits object - '+ JSON.stringify(hits[0]));
                //User Uid exists
                // GET Bank Data fron Banks Index
                var indexAliasName = routingUid+config.banks_alias_token_read;
                console.log('Alias name derived through routing is ->'+indexAliasName);
                var queryBody = {
                  index: indexAliasName,
                  type: config.index_base_type,
                  id: bankId
                };
                console.log('queryBody ->' + JSON.stringify(queryBody));
                esClient.get(queryBody)
                .then(function (bankData) {
                    console.log('Banks Data Retrieved Successfully!');
                    helper.success(res,bankData);
                    },
                      function (error) {
                        console.log('Banks document read ['+indexAliasName+'] Failed!' + JSON.stringify(error));
                        helper.failure(res,msgConfig.banks_record_retrieve_failed,500);
                    });
                }
              else{
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Too many user records found ['+config.user_index_write_alias_name+']! Duplicate records of the user exists. Conctact System Adminstrator.' + error);
                helper.failure(res,msgConfig.banks_duplicate_user_found + msgConfig.support_contact,500);
              }
          }, function (error) {
                  console.log('Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error);
                  helper.failure(res,msgConfig.banks_user_not_exists + msgConfig.support_contact,500);
              });//End: check user exists
       }//end if
       else {
         //index dosen't exist. Create one.
          console.log('Bank Index does not Exists! Can not get banks data. Error value is ->'+JSON.stringify(err));
          helper.failure(res,msgConfig.banks_user_index_not_exists + msgConfig.support_contact,404);
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
