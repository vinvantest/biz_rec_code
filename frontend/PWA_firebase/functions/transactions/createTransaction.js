'use strict';

var config  = require('../config.js');
var configTran = require('../config/specific/transaction_template_columns.js');
var configUser = require('../config/specific/user_template_columns.js');

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

function _respondSuccess(res, status, data, httpCode) {
     var response = {
       'status': status,
       'successFlag' : true,
       'data' : data
     };
     //  res.setHeader('Content-type', 'application/json');  - this is restify
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', '*');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', '*');
     res.set('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
     res.set('Access-Control-Max-Age', '1000');
     /*
     Access-Control-Allow-Credentials,
     Access-Control-Expose-Headers,
     Access-Control-Max-Age,
     Access-Control-Allow-Methods,
     Access-Control-Allow-Headers
     */
     res.status(httpCode).send(response);
}

function _respondArraySuccess(res, status, data, httpCode) {

     var response = {
       'status' : status,
       'successFlag' : true,
       'data' : [data]
     };

     res.set('Content-type', 'application/json');
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', '*');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', '*');
     res.set('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
     res.set('Access-Control-Max-Age', '1000');
    /*
    Access-Control-Allow-Credentials,
    Access-Control-Expose-Headers,
    Access-Control-Max-Age,
    Access-Control-Allow-Methods,
    Access-Control-Allow-Headers
    */
    res.status(httpCode).send(response);
}

function _respondFailure(res, status, data, httpCode) {
     var response = {
       'status': status,
       'successFlag' : false,
       'data' : data
     };
     //  res.setHeader('Content-type', 'application/json');  - this is restify
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', '*');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', '*');
     res.set('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
     res.set('Access-Control-Max-Age', '1000');
     /*
     Access-Control-Allow-Credentials,
     Access-Control-Expose-Headers,
     Access-Control-Max-Age,
     Access-Control-Allow-Methods,
     Access-Control-Allow-Headers
     */
     res.status(httpCode).send(response);
}

function success (res, data) {
 _respondSuccess(res, 'success', data, 200);
}

function successArray (res, data) {
 _respondArraySuccess(res, 'success', data, 200);
}

function failure (res, data, httpCode) {
 console.log('Error: ' + httpCode + ' ' + data);
 _respondFailure(res, 'failure', data, httpCode);
}

//https://us-central1-bizrec-dev.cloudfunctions.net/createTransactionsFunction?uid=JSSJS2@222dDD
// body {} -- coa object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(createRule())');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.tran));
   var uid = req.query.uid;
   var tranBody = req.body.tran;
   if(uid === null || uid === undefined) {
    resMsg = "Error: req.query.uid required to create Index in ES ->" + uid;
    failure(res,resMsg,401);
   }
   if(tranBody === null || tranBody === undefined) {
    resMsg = "Error: req.body.tranBody required to create Index in ES ->" + JSON.stringify(tranBody);
    failure(res,resMsg,401);
   }
   var tranAliasIndexName = uid + config.Transactions_alias_token_read;
   var tranAliasIndexName_write = uid + config.Transactions_alias_token_write;
   console.log('coa Aliases: read [' + tranAliasIndexName + ' ] write [' + tranAliasIndexName_write + ']');

   var queryBodyTranObject = {
     [configTran.tran_nuserId_routingAliasId]	:	tranBody.tran_nuserId_routingAliasId,
     [configTran.tran_userId_routingAliasId]	:	tranBody.tran_userId_routingAliasId,
     [configTran.tran_accountId]	:	tranBody.tran_accountId,
     [configTran.tran_accountNicName]	:	tranBody.tran_accountNicName,
     [configTran.tran_accountName]	:	tranBody.tran_accountName,
     [configTran.tran_date] 	:	tranBody.tran_date ,
     [configTran.tran_amount] 	:	tranBody.tran_amount ,
     [configTran.tran_baseType] 	:	tranBody.tran_baseType ,
     [configTran.tran_category] 	:	tranBody.ran_category ,
     [configTran.tran_postDate]	:	tranBody.tran_postDate,
     [configTran.tran_status]	:	tranBody.tran_status,
     [configTran.tran_description] 	:	tranBody.tran_description ,
     [configTran.tran_chequeNumber]	:	tranBody.tran_chequeNumber,
     [configTran.tran_CoACategoryId]	:	tranBody.tran_CoACategoryId,
     [configTran.tran_CoACategoryName]	:	tranBody.tran_CoACategoryName,
     [configTran.tran_CoASubCategoryId]	:	tranBody.tran_CoASubCategoryId,
     [configTran.tran_CoASubCategoryName]	:	tranBody.tran_CoASubCategoryName,
     [configTran.tran_isManual]	:	tranBody.tran_isManual,
     [configTran.tran_isAutoSyncRule]	:	tranBody.tran_isAutoSyncRule,
     [configTran.tran_merchantId]	:	tranBody.tran_merchantId,
     [configTran.tran_merchantName]	:	tranBody.tran_merchantName,
     [configTran.tran_merchantRuleId]	:	tranBody.tran_merchantRuleId,
     [configTran.tran_merchantRuleName]	:	tranBody.tran_merchantRuleName,
     [configTran.tran_isNew] : tranBody.tran_isNew,
     [configTran.tran_isVerified]	:	tranBody.tran_isVerified,
     [configTran.tran_providerId]	:	tranBody.tran_providerId,
     [configTran.tran_providerName]	:	tranBody.tran_providerName,
     [configTran.tran_isBusinessOrPersonalExpense]	:	tranBody.tran_isBusinessOrPersonalExpense,
     [configTran.tran_isSplitTransaction]	:	tranBody.tran_isSplitTransaction,
     [configTran.tran_splitBusinessAmount]	:	tranBody.tran_splitBusinessAmount,
     [configTran.tran_splitPersonalAmount]:	tranBody.tran_splitPersonalAmount,
     [configTran.tran_isReceiptAttached]	:	tranBody.tran_isReceiptAttached,
     [configTran.tran_receiptURL]	:	tranBody.tran_receiptURL,
     [configTran.tran_record_created]	:	tranBody.tran_record_created,
     [configTran.tran_is_record_updated] 	:	tranBody.tran_is_record_updated ,
     [configTran.tran_record_updated]	:	tranBody.tran_record_updated
   };
   console.log('Transactions Record to be updated/inserted = '+ JSON.stringify(queryBodyTranObject) );

   esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				failure(res, 'Error: elasticsearch cluster is down! -> ' + error, 500);
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
              resMsg = 'User does not exists in user index. Cannot insert new coa record!';
              console.log(resMsg);
              failure(res, resMsg, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodyTranExists = {
                     index : tranAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configTran.tran_amount] : tranBody.tran_amount } },
                                { term: { [configTran.tran_date] : tranBody.tran_date } },
                                { term: { [configTran.tran_accountId] : tranBody.tran_accountId } },
                                { term: { [configTran.tran_accountName] : tranBody.tran_accountName } },
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodyTranExists (JSON) is->'+JSON.stringify(queryBodyTranExists));
                esClient.search(queryBodyTranExists)
                  .then(function (resptranCheck) {
                    //check hits if there are any user records!
                    console.log('Transactions hits.total =' + resptranCheck.hits.total);
                    if(resptranCheck.hits.total === 0)
                    {
                      console.log('coa record does not exists. Creating a new one!');
                      //coa doesn't exists
                      esClient.index({
                                        index: tranAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodyTranObject
                            })
                            .then(function (respInserttran) {
                              resMsg = 'User Data existed and Transactions record inserted Successfully!' ;
                              console.log(resMsg);
                              success(res,resMsg);
                              },
                              function (errorInserttran) {
                              resMsg = 'Error : New Transactions document insertion ['+tranAliasIndexName_write+'] Failed!' + errorInserttran;
                              failure(res,resMsg,500);
                              });
                      }
                      else if(resptranCheck.hits.total === 1 )
                      {
                        console.log('Transactions record with matching BSB and Account number exists! Updating data...');
                        //update coa record
                        esClient.update({
                                          index: tranAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: resptranCheck.hits.hits[0]._id,
                                          body: {
                                            doc: tranBody
                                         }
                            })
                              .then(function (respInserttran) {
                                resMsg = 'Transaction Data existed and now updated Successfully!' ;
                                console.log(resMsg);
                                //esClient.close(); //use in lambda only
                                success(res,resMsg);
                                },
                                function (errorInserttran) {
                                resMsg = 'Error : Transactions document update ['+tranAliasIndexName+'] Failed! But old record exists.' + errorInserttran;
                                console.log(resMsg);
                                success(res,resMsg);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log('Error :: Too many copies of the coa record present!');
                        console.log('*****');
                        console.log(JSON.stringify(resptranCheck));
                        console.log('*****');
                        resMsg = 'Error : New Transactions document creation ['+tranAliasIndexName+'] Failed! Duplicate Transactions records for the user exists. Contact System Adminstrator.' + error;
                        failure(res,resMsg,500);
                      }
                    }, function (error) {
                            resMsg = 'Error : Transactions record not found in coa Index. Inserting new. Error = ' + error;
                            console.log(resMsg);
                            esClient.index({
                                              index: tranAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodyTranObject
                                  })
                                  .then(function (respInserttran) {
                                    resMsg = 'User Data existed and New Rule record inserted Successfully!' ;
                                    console.log(resMsg);
                                    success(res,resMsg);
                                    },
                                    function (errorInserttran) {
                                    resMsg = 'Error : New Transactions document insertion ['+ tranAliasIndexName_write +'] Failed!' + errorInserttran;
                                    failure(res,resMsg,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log('Too many user copies of the user present! Contact System Adminstrator!');
                console.log('*****');
                console.log(JSON.stringify(respUserCheck));
                console.log('*****');
                resMsg = 'Error : Transactions document creation/updation ['+tranAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error;
                failure(res,resMsg,500);
            }
          }, function (error) {
                  resMsg = 'Error : User not found in user Index. Error = ' + error;
                  console.log(resMsg);
                  failure(res,resMsg,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			resMsg = 'User Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
          console.log(resMsg);
          failure(res,resMsg,500);
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
