'use strict';

var config  = require('../config.js');
var configPymt = require('../config/specific/payment_template_columns.js');
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

//https://us-central1-bizrec-dev.cloudfunctions.net/createcoaFunction?uid=JSSJS2@222dDD
// body {} -- coa object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   console.log('Inside serer.post(createPayment())');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.pymt));
   var uid = req.query.uid;
   var pymtBody = req.body.pymt;
   if(uid === null || uid === undefined) {
    console.log("Error: req.query.uid required to create Index in ES ->" + uid);
    helper.failure(res,msgConfig.payments_invalid_uid + msgConfig.support_contact,401);
   }
   if(pymtBody === null || pymtBody === undefined) {
    console.log("Error: req.body.pymtBody required to create Index in ES ->" + JSON.stringify(pymtBody));
    helper.failure(res,msgConfig.payments_invalid_payment_body + msgConfig.support_contact,401);
   }
   var pymtAliasIndexName = uid + config.payments_alias_token_read;
   var pymtAliasIndexName_write = uid + config.payments_alias_token_write;
   console.log('Payments Aliases: read [' + pymtAliasIndexName + ' ] write [' + pymtAliasIndexName_write + ']');

   var queryBodycoaObject = {
     [configPymt.pymt_displayName]	:	pymtBody.pymt_displayName,
     [configPymt.pymt_supplierId]	:	pymtBody.pymt_supplierId,
     [configPymt.pymt_supplier_companyName]	:	pymtBody.pymt_supplier_companyName,
     [configPymt.pymt_supplier_familyName]	:	pymtBody.pymt_supplier_familyName,
     [configPymt.pymt_supplier_givenName] :	pymtBody.pymt_supplier_givenName,
     [configPymt.pymt_supplier_email]	:	pymtBody.pymt_supplier_email,
     [configPymt.pymt_totalPaymentAmount]	:	pymtBody.pymt_totalPaymentAmount,
     [configPymt.pymt_taxAmount]	:	pymtBody.pymt_taxAmount,
     [configPymt.pymt_taxType]	:	pymtBody.pymt_taxType,
     [configPymt.pymt_datePaymentMade]	:	pymtBody.pymt_datePaymentMade,
     [configPymt.pymt_paymentType]	: pymtBody.pymt_paymentType,
     [configPymt.pymt_coaExpenseCategory]	:	pymtBody.pymt_coaExpenseCategory,
     [configPymt.pymt_currency]	:	pymtBody.pymt_currency,
     [configPymt.pymt_discount] :	pymtBody.pymt_discount,
     [configPymt.pymt_isReceiptAttached]	:	pymtBody.pymt_isReceiptAttached,
     [configPymt.pymt_paymentNote]	:	pymtBody.pymt_paymentNote,
     [configPymt.pymt_isPartialPayment]	:	pymtBody.pymt_isPartialPayment,
     [configPymt.pymt_partialPaymentAmount]	:	pymtBody.pymt_partialPaymentAmount,
     [configPymt.pymt_record_created] 	:	pymtBody.pymt_record_created ,
     [configPymt.pymt_is_record_updated] 	:	pymtBody.pymt_is_record_updated ,
     [configPymt.pymt_record_updated]	:	pymtBody.pymt_record_updated
   };
   console.log('coa Record to be updated/inserted = '+ JSON.stringify(queryBodycoaObject) );

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
              helper.failure(res, msgConfig.payments_user_not_found + msgConfig.support_contact, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodyPymtExists = {
                     index : pymtAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configPymt.pymt_supplierId] : pymtBody.pymt_supplierId } },
                                { term: { [configPymt.pymt_supplier_email] : pymtBody.pymt_supplier_email } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodyPymtExists (JSON) is->'+JSON.stringify(queryBodyPymtExists));
                esClient.search(queryBodyPymtExists)
                  .then(function (respInvCheck) {
                    //check hits if there are any user records!
                    console.log('payments hits.total =' + respInvCheck.hits.total);
                    if(respInvCheck.hits.total === 0)
                    {
                      console.log('coa record does not exists. Creating a new one!');
                      //coa doesn't exists
                      esClient.index({
                                        index: pymtAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodycoaObject
                            })
                            .then(function (respInsertPymt) {
                              console.log('User Data existed and Payments record inserted Successfully!');
                              helper.success(res,msgConfig.payments_record_insert_success);
                              },
                              function (errorInsertPymt) {
                              console.log('Error : New Payments document insertion ['+pymtAliasIndexName_write+'] Failed!' + errorInsertPymt);
                              helper.failure(res,msgConfig.payments_record_insert_failed,500);
                              });
                      }
                      else if(respInvCheck.hits.total === 1 )
                      {
                        console.log('Payments record with matching BSB and Account number exists! Updating data...');
                        //update coa record
                        esClient.update({
                                          index: pymtAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respInvCheck.hits.hits[0]._id,
                                          body: {
                                            doc: pymtBody
                                         }
                            })
                              .then(function (respInsertPymt) {
                                console.log('Payment Data existed and now updated Successfully!');
                                helper.success(res,msgConfig.payments_record_update_success);
                                },
                                function (errorInsertPymt) {
                                console.log('Error : Payment document update ['+pymtAliasIndexName+'] Failed! But old record exists.' + errorInsertPymt);
                                helper.success(res,msgConfig.payments_record_update_failed);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log(JSON.stringify(respInvCheck));
                        console.log('Error : New Payment document creation ['+pymtAliasIndexName+'] Failed! Duplicate Payments records for the user exists. Contact System Adminstrator.' + error);
                        helper.failure(res,msgConfig.payments_duplicate_records + msgConfig.support_contact,500);
                      }
                    }, function (error) {
                            console.log('Error : Payment record not found in Payment Index. Inserting new. Error = ' + error);
                            esClient.index({
                                              index: pymtAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodycoaObject
                                  })
                                  .then(function (respInsertPymt) {
                                    console.log('User Data existed and New Payment record inserted Successfully!');
                                    helper.success(res,msgConfig.payments_record_insert_success);
                                    },
                                    function (errorInsertPymt) {
                                    console.log('Error : New Payments document insertion ['+ pymtAliasIndexName_write +'] Failed!' + errorInsertPymt);
                                    helper.failure(res,msgConfig.payments_record_insert_failed,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : coa document creation/updation ['+pymtAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error);
                helper.failure(res,msgConfig.payments_duplicate_records + msgConfig.support_contact,500);
            }
          }, function (error) {
                  console.log('Error : User not found in user Index. Error = ' + error);
                  helper.failure(res,msgConfig.payments_user_not_found + msgConfig.support_contact,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			console.log('User Index does not Exists!. Can not insert user to the index. Error Value = '+ error);
          helper.failure(res,msgConfig.payments_user_index_not_exists + msgConfig.support_contact,500);
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
