'use strict';

var config  = require('../config.js');
var configCust = require('../config/specific/customer_template_columns.js');
var configUser = require('../config/specific/user_template_columns.js');
var helper = require('../config/helpers/helper.js');

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

//https://us-central1-bizrec-dev.cloudfunctions.net/createCustFunction?uid=JSSJS2@222dDD
// body {} -- cust object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(createCust)');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.cust));
   var uid = req.query.uid;
   var custBody = req.body.cust;
   if(uid === null || uid === undefined) {
    resMsg = "Error: req.query.uid required to create Index in ES ->" + uid;
    helper.failure(res,resMsg,401);
   }
   if(custBody === null || custBody === undefined) {
    resMsg = "Error: req.body.custBody required to create Index in ES ->" + JSON.stringify(custBody);
    helper.failure(res,resMsg,401);
   }
   var custAliasIndexName = uid + config.customers_alias_token_read;
   var custAliasIndexName_write = uid + config.customers_alias_token_write;
   console.log('cust Aliases: read [' + custAliasIndexName + ' ] write [' + custAliasIndexName_write + ']');

   var queryBodycustObject = {
     [configCust.cust_userId_routingAliasId] : custBody.cust_userId_routingAliasId,
     [configCust.cust_displayName] : custBody.cust_displayName,
     [configCust.cust_companyNickName] : custBody.cust_companyNickName,
     [configCust.cust_contactfamilyName] : custBody.cust_contactfamilyName,
     [configCust.cust_contactMiddleName] : custBody.cust_contactMiddleName,
     [configCust.cust_email] : custBody.cust_email,
     [configCust.cust_currency] : custBody.cust_currency,
     [configCust.cust_discount] : custBody.cust_discount,
     [configCust.cust_businessCardURL] : custBody.cust_businessCardURL,
     [configCust.cust_company_businessName] :	custBody.cust_company_businessName,
     [configCust.cust_company_ABN_ACN_LC] :	custBody.cust_company_ABN_ACN_LC,
     [configCust.cust_company_address] :	custBody.cust_company_address,
     [configCust.cust_company_address_streetNumber] :	custBody.cust_company_address_streetNumber,
     [configCust.cust_company_address_streetName] :	custBody.cust_company_address_streetName,
     [configCust.cust_company_address_streetType] :	custBody.cust_company_address_streetType,
     [configCust.cust_company_address_suburb] :	custBody.cust_company_address_suburb,
     [configCust.cust_company_address_state] :	custBody.cust_company_address_state,
     [configCust.cust_company_address_postcode] :	custBody.cust_company_address_postcode,
     [configCust.cust_company_address_country] :	custBody.cust_company_address_country,
     [configCust.cust_company_address_contact] :	custBody.cust_company_address_contact,
     [configCust.cust_company_address_email] :	custBody.cust_company_address_email,
     [configCust.cust_record_created ] :	custBody.cust_record_created ,
     [configCust.cust_is_record_updated] :	custBody.cust_is_record_updated,
     [configCust.cust_record_updated] :	custBody.cust_record_updated
   };
   console.log('cust Record to be updated/inserted = '+ JSON.stringify(queryBodycustObject) );

   esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				helper.failure(res, 'Error: elasticsearch cluster is down! -> ' + error, 500);
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
              resMsg = 'User does not exists in user index. Cannot insert new cust record!';
              console.log(resMsg);
              helper.failure(res, resMsg, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new cust Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodyCustExists = {
                     index : custAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configCust.cust_email] : custBody.cust_email } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodyCustExists (JSON) is->'+JSON.stringify(queryBodyCustExists));
                esClient.search(queryBodyCustExists)
                  .then(function (respCustCheck) {
                    //check hits if there are any user records!
                    console.log('custs hits.total =' + respCustCheck.hits.total);
                    if(respCustCheck.hits.total === 0)
                    {
                      console.log('cust record does not exists. Creating a new one!');
                      //cust doesn't exists
                      esClient.index({
                                        index: custAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodycustObject
                            })
                            .then(function (respInsertCust) {
                              resMsg = 'User Data existed and customer record inserted Successfully!' ;
                              console.log(resMsg);
                              helper.success(res,resMsg);
                              },
                              function (errorInsertCust) {
                              resMsg = 'Error : New customer document insertion ['+custAliasIndexName_write+'] Failed!' + errorInsertCust;
                              helper.failure(res,resMsg,500);
                              });
                      }
                      else if(respCustCheck.hits.total === 1 )
                      {
                        console.log('customer record with matching BSB and Account number exists! Updating data...');
                        //update cust record
                        esClient.update({
                                          index: custAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respCustCheck.hits.hits[0]._id,
                                          body: {
                                            doc: custBody
                                         }
                            })
                              .then(function (respInsertCust) {
                                resMsg = 'customer Data existed and now updated Successfully!' ;
                                console.log(resMsg);
                                //esClient.close(); //use in lambda only
                                helper.success(res,resMsg);
                                },
                                function (errorInsertCust) {
                                resMsg = 'Error : customer document update ['+custAliasIndexName+'] Failed! But old record exists.' + errorInsertCust;
                                console.log(resMsg);
                                helper.success(res,resMsg);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log('Error :: Too many copies of the cust record present!');
                        console.log('*****');
                        console.log(JSON.stringify(respCustCheck));
                        console.log('*****');
                        resMsg = 'Error : New Customer document creation ['+custAliasIndexName+'] Failed! Duplicate customer records for the user exists. Contact System Adminstrator.' + error;
                        helper.failure(res,resMsg,500);
                      }
                    }, function (error) {
                            resMsg = 'Error : Customer record not found in cust Index. Inserting new. Error = ' + error;
                            console.log(resMsg);
                            esClient.index({
                                              index: custAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodycustObject
                                  })
                                  .then(function (respInsertCust) {
                                    resMsg = 'User Data existed and New customer record inserted Successfully!' ;
                                    console.log(resMsg);
                                    helper.success(res,resMsg);
                                    },
                                    function (errorInsertCust) {
                                    resMsg = 'Error : New customer document insertion ['+ custAliasIndexName_write +'] Failed!' + errorInsertCust;
                                    helper.failure(res,resMsg,500);
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
                resMsg = 'Error : cust document creation/updation ['+custAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error;
                helper.failure(res,resMsg,500);
            }
          }, function (error) {
                  resMsg = 'Error : User not found in user Index. Error = ' + error;
                  console.log(resMsg);
                  helper.failure(res,resMsg,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			resMsg = 'User Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
          console.log(resMsg);
          helper.failure(res,resMsg,500);
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
