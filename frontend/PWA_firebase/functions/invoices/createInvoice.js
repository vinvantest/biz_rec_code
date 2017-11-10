'use strict';

var config  = require('../config.js');
var configInv = require('../config/specific/invoice_template_columns.js');
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

function _respond(res, status, data, httpCode) {
        var response = {
          'status': status,
          'data' : data
        };
        //  res.setHeader('Content-type', 'application/json');  - this is restify
        res.set('Content-type', 'application/json');
        res.set('Access-Control-Allow-Origin', 'https://bizrec-dev.firebaseapp.com');
        res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
        res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
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

   function _respondArray(res, status, data, httpCode) {

        var response = {
          'status' : status,
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

   function success (res, data) {
    _respond(res, 'success', data, 200);
   }

   function successArray (res,data) {
    _respondArray(res, 'success', data, 200);
   }

   function failure (res, data, httpCode) {
    console.log('Error: ' + httpCode + ' ' + data);
    _respond(res, 'failure', data, httpCode);
   }

   //https://us-central1-bizrec-dev.cloudfunctions.net/createcoaFunction?uid=JSSJS2@222dDD
   // body {} -- coa object body
   function handlePOST (req, res, esClient)
   {
     // Do something with the POST request
      console.log('Inside serer.post(createcoa)');
      console.log('req.body.user = '+JSON.stringify(req.query.uid));
      console.log('req.body.user = '+JSON.stringify(req.body.inv));
      var uid = req.query.uid;
      var invBody = req.body.inv;
      if(uid === null || uid === undefined) {
       console.log("Error: req.query.uid required to create Index in ES ->" + uid);
       helper.failure(res,msgConfig.invoices_invalid_uid + msgConfig.support_contact,401);
      }
      if(invBody === null || invBody === undefined) {
       console.log("Error: req.body.invBody required to create Index in ES ->" + JSON.stringify(invBody));
       helper.failure(res,msgConfig.invoices_invalid_invoice_body+msgConfig.support_contact,401);
      }
      var invAliasIndexName = uid + config.invoices_alias_token_read;
      var invAliasIndexName_write = uid + config.invoices_alias_token_write;
      console.log('coa Aliases: read [' + invAliasIndexName + ' ] write [' + invAliasIndexName_write + ']');

      var queryBodyInvObject = {
        [configInv.inv_userId_routingAliasId]	:	invBody.inv_userId_routingAliasId,
        [configInv.inv_supplierId]	:	invBody.inv_supplierId,
        [configInv.inv_supplierDisplayName]	:	invBody.inv_supplierDisplayName,
        [configInv.inv_company_businessName	]:	invBody.inv_company_businessName,
        [configInv.inv_company_ABN_ACN_LC] :	invBody.inv_company_ABN_ACN_LC,
        [configInv.inv_company_address_streetNumber]	:	invBody.inv_company_address_streetNumber,
        [configInv.inv_company_address_streetName]	:	invBody.inv_company_address_streetName,
        [configInv.inv_company_address_streetType]	:	invBody.inv_company_address_streetType,
        [configInv.inv_company_address_suburb]	:	invBody.inv_company_address_suburb,
        [configInv.inv_company_address_state]	:	invBody.inv_company_address_state,
        [configInv.inv_company_address_postcode]	:	invBody.inv_company_address_postcode,
        [configInv.inv_company_address_country]	:	invBody.inv_company_address_country,
        [configInv.inv_company_address_contact]	:	invBody.inv_company_address_contact,
        [configInv.inv_company_address_email]	:	invBody.inv_company_address_email,
        [configInv.inv_company_careOf]	:	invBody.inv_company_careOf,
        [configInv.inv_invoiceDate]	:	invBody.inv_invoiceDate,
        [configInv.inv_purchaseOrderNumber]	:	invBody.inv_purchaseOrderNumber,
        [configInv.inv_dateOfService]	:	invBody.inv_dateOfService,
        [configInv.inv_goodsOrServiceDescription]	:	invBody.inv_goodsOrServiceDescription,
        [configInv.inv_TAX_Percentage]	:	invBody.inv_TAX_Percentage,
        [configInv.inv_TAX_amount]	:	invBody.inv_TAX_amount,
        [configInv.inv_TAX_Exemption]	:	invBody.inv_TAX_Exemption,
        [configInv.inv_netAmount]	:	invBody.inv_netAmount,
        [configInv.inv_currency]	:	invBody.inv_currency,
        [configInv.inv_discount]	:	invBody.inv_discount,
        [configInv.inv_creditNotes]	:	invBody.inv_creditNotes,
        [configInv.inv_BankBSB]	:	invBody.inv_BankBSB,
        [configInv.inv_BankAccount]	:	invBody.inv_BankAccount,
        [configInv.inv_BankAccountName]	:	invBody.inv_BankAccountName,
        [configInv.inv_isNew]	:	invBody.inv_isNew,
        [configInv.inv_isPaid]	:	invBody.inv_isPaid,
        [configInv.inv_record_created]	:	invBody.inv_record_created,
        [configInv.inv_is_record_updated]	:	invBody.inv_is_record_updated,
        [configInv.inv_record_updated]	:	invBody.inv_record_updated
      };
      console.log('Invoice Record to be updated/inserted = '+ JSON.stringify(queryBodyInvObject) );

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
                 helper.failure(res, msgConfig.invoices_user_not_found + msgConfig.support_contact, 404);
               }
               else if(respUserCheck.hits.total === 1 )
               {
                   //only one record for the user
                   console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                   console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                   var queryBodyInvExists = {
                        index : invAliasIndexName,
                        type : config.index_base_type,
                        body: {
                          query: {
                              constant_score: {
                                filter: {
                                  bool: {
                                    must: [
                                   { term: { [configInv.inv_supplierId] : invBody.inv_supplierId } },
                                   { term: { [configInv.inv_purchaseOrderNumber] : invBody.inv_purchaseOrderNumber } }
                                   ]
                                  }
                                }
                              }
                          }
                       }
                     };
                   console.log('queryBodyInvExists (JSON) is->'+JSON.stringify(queryBodyInvExists));
                   esClient.search(queryBodyInvExists)
                     .then(function (respInvCheck) {
                       //check hits if there are any user records!
                       console.log('coas hits.total =' + respInvCheck.hits.total);
                       if(respInvCheck.hits.total === 0)
                       {
                         console.log('Invoice record does not exists. Creating a new one!');
                         //coa doesn't exists
                         esClient.index({
                                           index: invAliasIndexName_write,
                                           type:  config.index_base_type,
                                           body:  queryBodyInvObject
                               })
                               .then(function (respInsertInv) {
                                 console.log('User Data existed and Invoice record inserted Successfully!');
                                 helper.success(res,msgConfig.invoices_record_insert_success);
                                 },
                                 function (errorInsertInv) {
                                 console.log('Error : New Invoice document insertion ['+invAliasIndexName_write+'] Failed!' + errorInsertInv);
                                 helper.failure(res,msgConfig.invoices_record_insert_failed,500);
                                 });
                         }
                         else if(respInvCheck.hits.total === 1 )
                         {
                           console.log('Invoice record with matching BSB and Account number exists! Updating data...');
                           //update coa record
                           esClient.update({
                                             index: invAliasIndexName_write,
                                             type: config.index_base_type,
                                             id: respInvCheck.hits.hits[0]._id,
                                             body: {
                                               doc: invBody
                                            }
                               })
                                 .then(function (respInsertInv) {
                                   console.log('Invoice Data existed and now updated Successfully!');
                                   helper.success(res,msgConfig.invoices_record_update_success);
                                   },
                                   function (errorInsertUser) {
                                   console.log('Error : Invoice document update ['+invAliasIndexName+'] Failed! But old record exists.' + errorInsertUser);
                                   helper.success(res,msgConfig.invoices_record_update_failed);
                                   //TODO update this response to failure with correct error code
                                   });
                         }
                         else {
                           //user has multiple records. Delete rest!
                           console.log(JSON.stringify(respInvCheck));
                           console.log('Error : New coa document creation ['+invAliasIndexName+'] Failed! Duplicate Invoice records for the user exists. Contact System Adminstrator.' + error);
                           helper.failure(res,msgConfig.invoices_duplicate_records + msgConfig.support_contact,500);
                         }
                       }, function (error) {
                               console.log('Error : Invoice record not found in Invoices Index. Inserting new. Error = ' + error);
                               esClient.index({
                                                 index: invAliasIndexName_write,
                                                 type:  config.index_base_type,
                                                 body:  queryBodyInvObject
                                     })
                                     .then(function (respInsertInv) {
                                       console.log('User Data existed and New Invoice record inserted Successfully!');
                                       helper.success(res,msgConfig.invoices_record_insert_success);
                                       },
                                       function (errorInsertInv) {
                                       console.log('Error : New Invoice document insertion ['+ invAliasIndexName_write +'] Failed!' + errorInsertInv);
                                       helper.failure(res,msgConfig.invoices_record_insert_failed,500);
                                       });
                   });//End: check user exists
               }//end user If === 1
               else
               {
                   //user has multiple records. Delete rest!
                   console.log(JSON.stringify(respUserCheck));
                   console.log('Error : Invoice document creation/updation ['+invAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error);
                   helper.failure(res,msgConfig.invoices_duplicate_user_found + msgConfig.support_contact,500);
               }
             }, function (error) {
                     console.log('Error : User not found in user Index. Error = ' + error);
                     helper.failure(res,msgConfig.invoices_user_not_found + msgConfig.support_contact,404);
                 });//End: check user exists
          }//end if user index exists
          else{
            //index dosen't exist. Create one.
       		 console.log('User Index does not Exists!. Can not insert Invoice to the index. Error Value = '+ error);
             helper.failure(res,msgConfig.invoices_user_index_not_exists + msgConfig.support_contact,500);
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
