'use strict';

var config  = require('../config.js');
var configSett = require('../config/specific/setting_template_columns.js');
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

//https://us-central1-bizrec-dev.cloudfunctions.net/createSettingFunction?uid=JSSJS2@222dDD
// body {} -- coa object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   console.log('Inside serer.post(createSetting())');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.sett));
   var uid = req.query.uid;
   var settBody = req.body.sett;
   if(uid === null || uid === undefined) {
    console.log("Error: req.query.uid required to create Index in ES ->" + uid);
    helper.failure(res,msgConfig.settings_invalid_uid + msgConfig.support_contact,401);
   }
   if(settBody === null || settBody === undefined) {
    console.log("Error: req.body.settBody required to create Index in ES ->" + JSON.stringify(settBody));
    helper.failure(res,msgConfig.settings_invalid_setting_body + msgConfig.support_contact,401);
   }
   var settAliasIndexName = uid + config.settings_alias_token_read;
   var settAliasIndexName_write = uid + config.settings_alias_token_write;
   console.log('coa Aliases: read [' + settAliasIndexName + ' ] write [' + settAliasIndexName_write + ']');

   var queryBodySettObject = {
     [configSett.sett_userId_routingAliasId]	:	settBody.sett_userId_routingAliasId,
     [configSett.sett_providerName]	:	settBody.sett_providerName,
     [configSett.sett_providerAccountId]	:	settBody.sett_providerAccountId,
     [configSett.sett_providerIdentifier]	:	settBody.sett_providerIdentifier,
     [configSett.sett_issettAccountActive]	:	settBody.sett_issettAccountActive,
     [configSett.sett_issettAccountVerified]	:	settBody.sett_issettAccountVerified,
     [configSett.sett_additonalsettNotes]	:	settBody.sett_additonalsettNotes,
     [configSett.sett_refreshInfo]	:	settBody.sett_refreshInfo,
     [configSett.sett_refreshInfo_statusCode]	:	settBody.sett_refreshInfo_statusCode,
     [configSett.sett_refreshInfo_statusMessage]	:	settBody.sett_refreshInfo_statusMessage,
     [configSett.sett_refreshInfo_status]	:	settBody.sett_refreshInfo_status,
     [configSett.sett_isManual]	:	settBody.sett_isManual,
     [configSett.sett_createdDate]	:	settBody.sett_createdDate,
     [configSett.sett_lastUpdated] :	settBody.sett_lastUpdated,
     [configSett.sett_isAutoRefreshEnabled]	:	settBody.sett_isAutoRefreshEnabled,
     [configSett.sett_numberOfTransactionDays]	:	settBody.sett_numberOfTransactionDays,
     [configSett.sett_settAccountName]	:	settBody.sett_settAccountName,
     [configSett.sett_settAccountNumber]	:	settBody.sett_settAccountNumber,
     [configSett.sett_BSB]	:	settBody.sett_BSB,
     [configSett.sett_Branch]	:	settBody.sett_Branch,
     [configSett.sett_BranchNumber]	:	settBody.sett_BranchNumber,
     [configSett.sett_amountDue]	:	settBody.sett_amountDue,
     [configSett.sett_availableBalance]	:	settBody.sett_availableBalance,
     [configSett.sett_availableCash]	:	settBody.sett_availableCash,
     [configSett.sett_availableCredit]	:	settBody.sett_availableCredit,
     [configSett.sett_nickname]	:	settBody.sett_nickname,
     [configSett.sett_status]	:	settBody.sett_status,
     [configSett.sett_record_created]	:	settBody.sett_record_created,
     [configSett.sett_is_record_updated]	:	settBody.sett_is_record_updated,
     [configSett.sett_record_updated]	:	settBody.sett_record_updated
   };
   console.log('Settings Record to be updated/inserted = '+ JSON.stringify(queryBodySettObject) );

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
              helper.failure(res, msgConfig.settings_user_not_found + msgConfig.support_contact, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodySettExists = {
                     index : settAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configSett.sett_nickname] : settBody.sett_nickname } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodySettExists (JSON) is->'+JSON.stringify(queryBodySettExists));
                esClient.search(queryBodySettExists)
                  .then(function (respSettCheck) {
                    //check hits if there are any user records!
                    console.log('settings hits.total =' + respSettCheck.hits.total);
                    if(respSettCheck.hits.total === 0)
                    {
                      console.log('coa record does not exists. Creating a new one!');
                      //coa doesn't exists
                      esClient.index({
                                        index: settAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodySettObject
                            })
                            .then(function (respInsertSett) {
                              console.log('User Data existed and settings record inserted Successfully!');
                              helper.success(res,msgConfig.settings_record_insert_success);
                              },
                              function (errorInsertSett) {
                              console.log('Error : New settings document insertion ['+settAliasIndexName_write+'] Failed!' + errorInsertSett);
                              helper.failure(res,msgConfig.settings_record_insert_failed,500);
                              });
                      }
                      else if(respSettCheck.hits.total === 1 )
                      {
                        console.log('settings record with matching BSB and Account number exists! Updating data...');
                        //update coa record
                        esClient.update({
                                          index: settAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respSettCheck.hits.hits[0]._id,
                                          body: {
                                            doc: settBody
                                         }
                            })
                              .then(function (respInsertSett) {
                                console.log('Settings Data existed and now updated Successfully!');
                                helper.success(res,msgConfig.settings_record_update_success);
                                },
                                function (errorInsertSett) {
                                console.log('Error : Settings document update ['+settAliasIndexName+'] Failed! But old record exists.' + errorInsertSett);
                                helper.success(res,msgConfig.settings_record_update_failed);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log(JSON.stringify(respSettCheck));
                        console.log('Error : New Settings document creation ['+settAliasIndexName+'] Failed! Duplicate settings records for the user exists. Contact System Adminstrator.' + error);
                        helper.failure(res,msgConfig.settings_duplicate_records + msgConfig.support_contact,500);
                      }
                    }, function (error) {
                            console.log('Error : Settings record not found in coa Index. Inserting new. Error = ' + error);
                            esClient.index({
                                              index: settAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodySettObject
                                  })
                                  .then(function (respInsertSett) {
                                    console.log('User Data existed and New Settings record inserted Successfully!');
                                    helper.success(res,msgConfig.settings_record_insert_success);
                                    },
                                    function (errorInsertSett) {
                                    console.log('Error : New settings document insertion ['+ settAliasIndexName_write +'] Failed!' + errorInsertSett);
                                    helper.failure(res,msgConfig.settings_record_insert_failed,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Settings document creation/updation ['+settAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error);
                helper.failure(res,msgConfig.settings_duplicate_user_found + msgConfig.support_contact,500);
            }
          }, function (error) {
                  console.log('Error : User not found in user Index. Error = ' + error);
                  helper.failure(res,msgConfig.settings_user_not_exists + msgConfig.support_contact,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			console.log('User Index does not Exists!. Can not insert user to the index. Error Value = '+ error);
          helper.failure(res,msgConfig.settings_user_index_not_exists + msgConfig.support_contact,500);
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
