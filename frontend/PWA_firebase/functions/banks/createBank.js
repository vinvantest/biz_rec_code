'use strict';

var config  = require('../config.js');
var configBank = require('../config/specific/bank_template_columns.js');
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

//https://us-central1-bizrec-dev.cloudfunctions.net/createBankFunction?uid=JSSJS2@222dDD
// body {} -- bank object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request

   console.log('Inside serer.post(createBank)');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.bank));
   var uid = req.query.uid;
   var bankBody = req.body.bank;
   if(uid === null || uid === undefined) {
    console.log("Error: req.query.uid required to create Index in ES ->" + uid);
    helper.failure(res,msgConfig.banks_invalid_uid + msgConfig.support_contact,401);
   }
   if(bankBody === null || bankBody === undefined) {
    console.log("Error: req.body.bankBody required to create Index in ES ->" + JSON.stringify(bankBody));
    helper.failure(res,msgConfig.banks_invalid_bank_body + msgConfig.support_contact,401);
   }
   var bankAliasIndexName = uid + config.banks_alias_token_read;
   var bankAliasIndexName_write = uid + config.banks_alias_token_write;
   console.log('Bank Aliases: read [' + bankAliasIndexName + ' ] write [' + bankAliasIndexName_write + ']');

   var queryBodyBankObject = {
     [configBank.bank_userIdRoutingAliasId] : bankBody.bank_userIdRoutingAliasId,
     [configBank.bank_providerName] : bankBody.bank_providerName,
     [configBank.bank_providerAccountId] : bankBody.bank_providerAccountId,
     [configBank.bank_providerIdentifier] : bankBody.bank_providerIdentifier,
     [configBank.bank_isBankAccountActive] : bankBody.bank_isBankAccountActive,
     [configBank.bank_isBankAccountVerified] : bankBody.bank_isBankAccountVerified,
     [configBank.bank_additonalBankNotes] : bankBody.bank_additonalBankNotes,
     [configBank.bank_refreshInfo] : bankBody.bank_refreshInfo,
     [configBank.bank_refreshInfoStatusCode] : bankBody.bank_refreshInfoStatusCode,
     [configBank.bank_refreshInfoStatusMessage] : bankBody.bank_refreshInfoStatusMessage,
     [configBank.bank_refreshInfo_status] : bankBody.bank_refreshInfo_status,
     [configBank.bank_isManual] : bankBody.bank_isManual,
     [configBank.bank_createdDate] : bankBody.bank_createdDate,
     [configBank.bank_lastUpdated] : bankBody.bank_lastUpdated,
     [configBank.bank_isAutoRefreshEnabled] : bankBody.bank_isAutoRefreshEnabled,
     [configBank.bank_numberOfTransactionDays] : bankBody.bank_numberOfTransactionDays,
     [configBank.bank_bankAccountName] : bankBody.bank_bankAccountName,
     [configBank.bank_bankAccountNumber] : bankBody.bank_bankAccountNumber,
     [configBank.bank_BSB] : bankBody.bank_BSB,
     [configBank.bank_Branch] : bankBody.bank_Branch,
     [configBank.bank_BranchNumber] : bankBody.bank_BranchNumber,
     [configBank.bank_amountDue] : bankBody.bank_amountDue,
     [configBank.bank_availableBalance] : bankBody.bank_availableBalance,
     [configBank.bank_availableCash] : bankBody.bank_availableCash,
     [configBank.bank_availableCredit] : bankBody.bank_availableCredit,
     [configBank.bank_nickname] : bankBody.bank_nickname,
     [configBank.bank_status] : bankBody.bank_status,
     [configBank.bank_recordCreated] : bankBody.bank_recordCreated,
     [configBank.bank_isRecordUpdated] : bankBody.bank_isRecordUpdated,
     [configBank.bank_recordUpdated] : bankBody.bank_recordUpdated
   };
   console.log('Bank Record to be updated/inserted = '+ JSON.stringify(queryBodyBankObject) );

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
              console.log('User does not exists in user index. Cannot insert new Bank record!');
              helper.failure(res, msgConfig.banks_user_not_exists, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new Bank Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                /*
                SELECT product
                FROM   products
                WHERE  (price = 20 OR productID = "XHDK-A-1293-#fJ3")
                  AND  (price != 30)

                  GET /my_store/products/_search
                  {
                     "query" : {
                        "constant_score" : {
                           "filter" : {
                              "bool" : {
                                "should" : [
                                   { "term" : {"price" : 20}},
                                   { "term" : {"productID" : "XHDK-A-1293-#fJ3"}}
                                ],
                                "must_not" : {
                                   "term" : {"price" : 30}
                                }
                             }
                           }
                        }
                     }
                  }
                */
                var queryBodyBankExists = {
                     index : bankAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configBank.bank_BSB] : bankBody.bank_BSB } },
                                { term: { [configBank.bank_bankAccountNumber] : bankBody.bank_bankAccountNumber } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodyBankExists (JSON) is->'+JSON.stringify(queryBodyBankExists));
                esClient.search(queryBodyBankExists)
                  .then(function (respBankCheck) {
                    //check hits if there are any user records!
                    console.log('Banks hits.total =' + respBankCheck.hits.total);
                    if(respBankCheck.hits.total === 0)
                    {
                      console.log('Bank record does not exists. Creating a new one!');
                      //bank doesn't exists
                      esClient.index({
                                        index: bankAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodyBankObject
                            })
                            .then(function (respInsertBank) {
                              console.log('Banking record inserted Successfully!' + respInsertBank) ;
                              helper.success(res,msgConfig.banks_record_insert_success);
                              },
                              function (errorInsertBank) {
                              console.log('New Banking document insertion ['+bankAliasIndexName_write+'] Failed!' + errorInsertBank);
                              helper.failure(res,msgConfig.banks_record_insert_failed,500);
                              });
                      }
                      else if(respBankCheck.hits.total === 1 )
                      {
                        console.log('Banking record with matching BSB and Account number exists! Updating data...');
                        //update bank record
                        esClient.update({
                                          index: bankAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respBankCheck.hits.hits[0]._id,
                                          body: {
                                            doc: bankBody
                                         }
                            })
                              .then(function (respInsertUser) {
                                console.log('Banking Data existed and now updated Successfully!');
                                helper.success(res,msgConfig.banks_record_update_success);
                                },
                                function (errorInsertUser) {
                                console.log('Error : Banking document update ['+bankAliasIndexName+'] Failed! But old record exists.' + errorInsertUser);
                                helper.success(res,msgConfig.banks_record_update_failed);
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log(JSON.stringify(respBankCheck));
                        console.log('Error : New Bank document creation ['+bankAliasIndexName+'] Failed! Duplicate banking records for the user exists. Contact System Adminstrator.' + error);
                        helper.failure(res,msgConfig.banks_duplicate_records + msgConfig.support_contact,500);
                      }
                    }, function (error) {
                            console.log('Error : Bank record not found in bank Index. Inserting new. Error = ' + error);
                            esClient.index({
                                              index: bankAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodyBankObject
                                  })
                                  .then(function (respInsertBank) {
                                    console.log('New Banking record inserted Successfully!');
                                    helper.success(res,msgConfig.banks_record_insert_success);
                                    },
                                    function (errorInsertBank) {
                                    console.log('Error : New Banking document insertion ['+ bankAliasIndexName_write +'] Failed!' + errorInsertBank);
                                    helper.failure(res,msgConfig.banks_record_insert_failed + msgConfig.support_contact,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Bank document creation/updation ['+bankAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error);
                helper.failure(res,msgConfig.banks_duplicate_records + msgConfig.support_contact,500);
            }
          }, function (error) {
                  console.log('Error : User not found in user Index. Error = ' + error);
                  helper.failure(res,msgConfig.banks_user_not_found + msgConfig.support_contact,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			console.log('User Index does not Exists!. Can not insert user to the index. Error Value = '+ error);
          helper.failure(res,msgConfig.banks_user_index_not_exists + msgConfig.support_contact,500);
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
