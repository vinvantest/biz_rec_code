'use strict';

var config  = require('../config.js');
var configRule = require('../config/specific/rule_template_columns.js');
var configUser = require('../config/specific/user_template_columns.js');
var helper = require('../config/helpers/helper.js');
var msgConfig = require('../config/global/messages.js');

function handleGET(req, res) {
  // Do something with the GET request
  res.status(403).send('Forbidden!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handleDELETE (req, res) {
  // Do something with the DELETE request
  res.status(403).send('Forbidden!');
}

function handleOPTIONS(req, res) {
  console.log('inside handleOPTIONS()');
  res.set('Access-Control-Allow-Origin', 'https://bizrec-dev.firebaseapp.com')
	   .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT')
	   .status(200);
	   return;
}

//https://us-central1-bizrec-dev.cloudfunctions.net/createRuleFunction?uid=JSSJS2@222dDD
// body {} -- coa object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   console.log('Inside serer.post(createRule())');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.rule));
   var uid = req.query.uid;
   var ruleBody = req.body.rule;
   if(uid === null || uid === undefined) {
    console.log("Error: req.query.uid required to create Index in ES ->" + uid);
    helper.failure(res,msgConfig.rules_invalid_uid + msgConfig.support_contact,401);
   }
   if(ruleBody === null || ruleBody === undefined) {
    console.log("Error: req.body.ruleBody required to create Index in ES ->" + JSON.stringify(ruleBody));
    helper.failure(res,msgConfig.rules_invalid_rule_body + msgConfig.support_contact,401);
   }
   var ruleAliasIndexName = uid + config.rules_alias_token_read;
   var ruleAliasIndexName_write = uid + config.rules_alias_token_write;
   console.log('coa Aliases: read [' + ruleAliasIndexName + ' ] write [' + ruleAliasIndexName_write + ']');

   var queryBodyRuleObject = {
     [configRule.rule_userId_routingAliasId]	:	ruleBody.rule_userId_routingAliasId,
     [configRule.rule_ruleName]	:	ruleBody.rule_ruleName,
     [configRule.rule_sRuleBusinessType]	:	ruleBody.rule_sRuleBusinessType,
     [configRule.rule_supplierId]	:	ruleBody.rule_supplierId,
     [configRule.rule_CoACategoryId]	:	ruleBody.rule_CoACategoryId,
     [configRule.rule_CoASubCategoryId]	:	ruleBody.rule_CoASubCategoryId,
     [configRule.rule_bankAccount]	:	ruleBody.rule_bankAccount,
     [configRule.rule_dateCreated]	:	ruleBody.rule_dateCreated,
     [configRule.rule_isRuleActive]	:	ruleBody.rule_isRuleActive,
     [configRule.rule_record_created]	:	ruleBody.rule_record_created,
     [configRule.rule_is_record_updated]	:	ruleBody.rule_is_record_updated,
     [configRule.rule_record_updated]	:	ruleBody.rule_record_updated
   };
   console.log('Rule Record to be updated/inserted = '+ JSON.stringify(queryBodyRuleObject) );

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

	 console.log('Checking if user index Exists('+ config.user_index_name +')');
	 esClient.indices.exists({index: config.user_index_name})
		 .then(function (error,resp) {
       console.log('error value -' + error);
       console.log('response value - ' + resp);
       if(error)
       {
        console.log('Index ['+config.user_index_name+'] exists in ElasticSearch. Response is ->'+error);
        //check if UID exists in users index using global_alisas_for_search_users_index
        var queryBodyCheckUserExists = {
             index : config.user_index_search_alias_name,
             type : config.index_base_type,
             body: {
               query: {
                    match: {
                      [configUser.usr_uid] : uid
                    }
                  }
             }
        };
        console.log('queryBodyCheckUserExists (JSON) is->'+JSON.stringify(queryBodyCheckUserExists));
        esClient.search(queryBodyCheckUserExists)
          .then(function (respUserCheck) {
            //check hits if there are any user records!
            console.log('User hits.total =' + respUserCheck.hits.total);
            if(respUserCheck.hits.total === 0)
            {
              //user doesn't exists
              console.log('User does not exists in user index. Cannot insert new coa record!');
              helper.failure(res, msgConfig.rules_user_not_found + msgConfig.support_contact, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodyRuleExists = {
                     index : ruleAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configRule.rule_supplierId] : ruleBody.rule_supplierId } },
                                { term: { [configRule.rule_CoACategoryId] : ruleBody.rule_CoACategoryId } },
                                { term: { [configRule.rule_ruleName] : ruleBody.rule_ruleName } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodyRuleExists (JSON) is->'+JSON.stringify(queryBodyRuleExists));
                esClient.search(queryBodyRuleExists)
                  .then(function (respRuleCheck) {
                    //check hits if there are any user records!
                    console.log('rules hits.total =' + respRuleCheck.hits.total);
                    if(respRuleCheck.hits.total === 0)
                    {
                      console.log('coa record does not exists. Creating a new one!');
                      //coa doesn't exists
                      esClient.index({
                                        index: ruleAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodyRuleObject
                            })
                            .then(function (respInsertRule) {
                              console.log('User Data existed and rules record inserted Successfully!');
                              helper.success(res,msgConfig.rules_record_insert_success);
                              },
                              function (errorInsertRule) {
                              console.log('Error : New rules document insertion ['+ruleAliasIndexName_write+'] Failed!' + errorInsertRule);
                              helper.failure(res,msgConfig.rules_record_insert_failed,500);
                              });
                      }
                      else if(respRuleCheck.hits.total === 1 )
                      {
                        console.log('rules record with matching BSB and Account number exists! Updating data...');
                        //update coa record
                        esClient.update({
                                          index: ruleAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respRuleCheck.hits.hits[0]._id,
                                          body: {
                                            doc: ruleBody
                                         }
                            })
                              .then(function (respInsertRule) {
                                console.log('Rule Data existed and now updated Successfully!');
                                helper.success(res,msgConfig.rules_record_update_success);
                                },
                                function (errorInsertRule) {
                                console.log('Error : Rule document update ['+ruleAliasIndexName+'] Failed! But old record exists.' + errorInsertRule);
                                helper.success(res,msgConfig.rules_record_update_failed);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log(JSON.stringify(respRuleCheck));
                        console.log('Error : New Rule document creation ['+ruleAliasIndexName+'] Failed! Duplicate rules records for the user exists. Contact System Adminstrator.' + error);
                        helper.failure(res,msgConfig.rules_duplicate_records + msgConfig.support_contact,500);
                      }
                    }, function (error) {
                            console.log('Error : Rule record not found in coa Index. Inserting new. Error = ' + error);
                            esClient.index({
                                              index: ruleAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodyRuleObject
                                  })
                                  .then(function (respInsertRule) {
                                    console.log('User Data existed and New Rule record inserted Successfully!');
                                    helper.success(res,msgConfig.rules_record_update_success);
                                    },
                                    function (errorInsertRule) {
                                    console.log('Error : New rules document insertion ['+ ruleAliasIndexName_write +'] Failed!' + errorInsertRule);
                                    helper.failure(res,msgConfig.rules_record_update_failed,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Rule document creation/updation ['+ruleAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error);
                helper.failure(res,msgConfig.rules_duplicate_records + msgConfig.support_contact,500);
            }
          }, function (error) {
                  console.log('Error : User not found in user Index. Error = ' + error);
                  helper.failure(res,msgConfig.rules_user_not_found + msgConfig.support_contact,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			console.log('User Index does not Exists!. Can not insert user to the index. Error Value = '+ error);
          helper.failure(res,msgConfig.rules_user_index_not_exists + msgConfig.support_contact,500);
       }
     });//end then - indices.exists()

}//end POST

exports.handler = function(req, res, database, esClient)
{
  var usersRef = database.ref('users');
  switch (req.method) {
  case 'GET':
    handleGET(req, res);
    break;
  case 'PUT':
    handlePUT(req, res);
    break;
  case 'POST':
      handlePOST(req, res, esClient);
      break;
  case 'DELETE':
       handleDELETE(req, res);
       break;
  case 'OPTIONS':
       handleOPTIONS(req, res)
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
