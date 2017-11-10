'use strict';

var config  = require('../config.js');
var configSupp = require('../config/specific/supplier_template_columns.js');
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

//https://us-central1-bizrec-dev.cloudfunctions.net/createSupplierFunction?uid=JSSJS2@222dDD
// body {} -- coa object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   console.log('Inside serer.post(createRule())');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.supp));
   var uid = req.query.uid;
   var suppBody = req.body.supp;
   if(uid === null || uid === undefined) {
    console.log("Error: req.query.uid required to create Index in ES ->" + uid);
    helper.failure(res,msgConfig.suppliers_invalid_uid + msgConfig.support_contact,401);
   }
   if(suppBody === null || suppBody === undefined) {
    console.log("Error: req.body.suppBody required to create Index in ES ->" + JSON.stringify(suppBody));
    helper.failure(res,msgConfig.suppliers_invalid_supplier_body + msgConfig.support_contact,401);
   }
   var suppAliasIndexName = uid + config.suppliers_alias_token_read;
   var suppAliasIndexName_write = uid + config.suppliers_alias_token_write;
   console.log('Supplier Aliases: read [' + suppAliasIndexName + ' ] write [' + suppAliasIndexName_write + ']');

   var queryBodySuppObject = {
     [configSupp.supp_nuserId_routingAliasId]	:	suppBody.supp_nuserId_routingAliasId,
     [configSupp.supp_displayName]	:	suppBody.supp_displayName,
     [configSupp.supp_organisationName]	:	suppBody.supp_organisationName,
     [configSupp.supp_contactFirstName]	:	suppBody.supp_contactFirstName,
     [configSupp.supp_familyName]	:	suppBody.supp_familyName,
     [configSupp.supp_middleName]	:	suppBody.supp_middleName,
     [configSupp.supp_email]	:	suppBody.supp_email,
     [configSupp.supp_currency]	:	suppBody.supp_currency,
     [configSupp.supp_discount]	:	suppBody.supp_discount,
     [configSupp.supp_businessCardURL]	:	suppBody.supp_businessCardURL,
     [configSupp.supp_company_businessName]	:	suppBody.supp_company_businessName,
     [configSupp.supp_company_ABN_ACN_LC]	:	suppBody.supp_company_ABN_ACN_LC,
     [configSupp.supp_company_address_streetNumber]	:	suppBody.supp_company_address_streetNumber,
     [configSupp.supp_company_address_streetName]	:	suppBody.supp_company_address_streetName,
     [configSupp.supp_company_address_streetType]	:	suppBody.supp_company_address_streetType,
     [configSupp.supp_company_address_suburb]	:	suppBody.supp_company_address_suburb,
     [configSupp.supp_company_address_state]	:	suppBody.supp_company_address_state,
     [configSupp.supp_company_address_postcode]	:	suppBody.supp_company_address_postcode,
     [configSupp.supp_company_address_country]	:	suppBody.supp_company_address_country,
     [configSupp.supp_company_address_contact]	:	suppBody.supp_company_address_contact,
     [configSupp.supp_company_address_email]	:	suppBody.supp_company_address_email,
     [configSupp.supp_record_created]	:	suppBody.supp_record_created,
     [configSupp.supp_is_record_updated]	:	suppBody.supp_is_record_updated,
     [configSupp.supp_record_updated]	:	suppBody.supp_record_updated
   };
   console.log('Supplier Record to be updated/inserted = '+ JSON.stringify(queryBodySuppObject) );

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
              helper.failure(res, msgConfig.suppliers_user_not_found + msgConfig.support_contact, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodySuppExists = {
                     index : suppAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configSupp.supp_organisationName] : suppBody.supp_organisationName } },
                                { term: { [configSupp.supp_email] : suppBody.supp_email } },
                                { term: { [configSupp.supp_displayName] : suppBody.supp_displayName } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodySuppExists (JSON) is->'+JSON.stringify(queryBodySuppExists));
                esClient.search(queryBodySuppExists)
                  .then(function (respSuppCheck) {
                    //check hits if there are any user records!
                    console.log('suppliers hits.total =' + respSuppCheck.hits.total);
                    if(respSuppCheck.hits.total === 0)
                    {
                      console.log('coa record does not exists. Creating a new one!');
                      //coa doesn't exists
                      esClient.index({
                                        index: suppAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodySuppObject
                            })
                            .then(function (respInsertSupp) {
                              console.log('User Data existed and suppliers record inserted Successfully!');
                              helper.success(res,msgConfig.suppliers_record_insert_success);
                              },
                              function (errorInsertSupp) {
                              console.log('Error : New suppliers document insertion ['+suppAliasIndexName_write+'] Failed!' + errorInsertSupp);
                              helper.failure(res,msgConfig.suppliers_record_insert_failed,500);
                              });
                      }
                      else if(respSuppCheck.hits.total === 1 )
                      {
                        console.log('suppliers record with matching BSB and Account number exists! Updating data...');
                        //update coa record
                        esClient.update({
                                          index: suppAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respSuppCheck.hits.hits[0]._id,
                                          body: {
                                            doc: suppBody
                                         }
                            })
                              .then(function (respInsertSupp) {
                                console.log('Suplier Data existed and now updated Successfully!');
                                helper.success(res,msgConfig.suppliers_record_update_success);
                                },
                                function (errorInsertSupp) {
                                console.log('Error : Suppllier document update ['+suppAliasIndexName+'] Failed! But old record exists.' + errorInsertSupp);
                                helper.success(res,msgConfig.suppliers_record_update_failed);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log(JSON.stringify(respSuppCheck));
                        console.log('Error : New Supplier document creation ['+suppAliasIndexName+'] Failed! Duplicate suppliers records for the user exists. Contact System Adminstrator.' + error);
                        helper.failure(res,msgConfig.suppliers_duplicate_records + msgConfig.support_contact,500);
                      }
                    }, function (error) {
                            console.log('Error : Supplier record not found in coa Index. Inserting new. Error = ' + error);
                            esClient.index({
                                              index: suppAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodySuppObject
                                  })
                                  .then(function (respInsertSupp) {
                                    console.log('User Data existed and New Rule record inserted Successfully!');
                                    helper.success(res,msgConfig.suppliers_record_insert_success);
                                    },
                                    function (errorInsertSupp) {
                                    console.log('Error : New suppliers document insertion ['+ suppAliasIndexName_write +'] Failed!' + errorInsertSupp);
                                    helper.failure(res,msgConfig.suppliers_record_insert_failed,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log(JSON.stringify(respUserCheck));
                console.log('Error : Supplier document creation/updation ['+suppAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error);
                helper.failure(res,msgConfig.suppliers_duplicate_user_found + msgConfig.support_contact,500);
            }
          }, function (error) {
                  console.log('Error : User not found in user Index. Error = ' + error);
                  helper.failure(res,msgConfig.suppliers_user_not_found + msgConfig.support_contact,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			console.log('User Index does not Exists!. Can not insert user to the index. Error Value = '+ error);
          helper.failure(res,msgConfig.suppliers_user_index_not_exists + msgConfig.support_contact,500);
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
