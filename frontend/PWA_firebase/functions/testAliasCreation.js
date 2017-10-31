'use strict';

var config  = require('./config.js');
var configUser = require('./config/specific/user_template_columns.js');

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

function checkAndCreateAlias(indexName, termValue, routingValue, resMsg, aliasToken, req, res, esClient)
{
  console.log('index ['+indexName+'] with UUID ['+routingValue+']. Creating Alias for index ['+indexName+']!');
  var aliasBodyWrite = {
      "actions": [{
          "add": {
                  "filter": {"term": { termValue : routingValue}},
                  "routing": routingValue
                 }
      }]
  };
  var aliasBodySearch =
      {
        "actions" : [{
          "add": {
                "filter": {"term": { termValue : routingValue}},
                "routing": routingValue
                }
      }]
  };

  console.log('indexName: '+indexName+ ' name: '+routingValue + aliasToken + 'read');
  //e.g. name: 2344d4523sdg4_banks_read
  esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'read'},
        function (errorRespExists, respReadExists, statusReadExists) {
    console.log('errorRespExists = ' + errorRespExists);
    console.log('respReadExists = ' + respReadExists);
    console.log('statusReadExists = '+ statusReadExists );
      if(errorRespExists)
      {
        console.log('Index Alias ['+indexName+'] exists in ElasticSearch AND Alias['+routingValue + aliasToken + 'read'+'] for read exists. Checking now if write exists = '+respReadExists);
        //checking wirte alias exists
        esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'write'},
              function (errorWriteExists, respWriteExists, statusWriteExists) {
                console.log('errorWriteExists = ' + errorWriteExists);
                console.log('respWriteExists = ' + respWriteExists);
                console.log('statusWriteExists = '+ statusWriteExists );
                if(errorWriteExists)
                {
                  resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias ['+routingValue + aliasToken + 'read'+'] and ['+routingValue + aliasToken + 'write'+'] Read and Write already EXISTS = '+respWriteExists;
                  console.log(resMsg);
                  success(res, resMsg);
                }
                else {
                  console.log('Index ['+indexName+'] exists in ElasticSearch Alias for read exists ['+routingValue + aliasToken + 'read'+'] AND Alias write DOES NOT EXISTS. Creating now! response value ='+respWriteExists);
                  //put write alias
                  esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'write', body: aliasBodyWrite })
                    .then(function (resp){
                        resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias ['+routingValue + aliasToken + 'write'+'] write created as read already existed = '+resp;
                        console.log(resMsg);
                        success(res, resMsg);;
                      }, function (error) {
                        resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error);
                        console.log(resMsg);
                        failure(res, resMsg, 500);
                      }); //end putAlias(write)
                }
              });
      }
      else {
        console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias ['+routingValue + aliasToken + 'read'+']read DOES NOT EXISTS! creating now! response is ='+respReadExists);
        //put read alias
        esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'read', body: aliasBodySearch })
          .then(function (resp){
                  console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias ['+routingValue + aliasToken + 'read'+']read newly created now checking if write ['+routingValue + aliasToken + 'write'+'] exists = '+resp);
                  resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias ['+routingValue + aliasToken + 'read'+'] read newly created now checking if write ['+routingValue + aliasToken + 'write'+'] exists = '+resp;
                  //now check if write exists
                  esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'write'},
                    function (errorWirteEx, respWriteEx, statusWriteEx) {
                      console.log('errorWirteEx = ' + errorWirteEx);
                      console.log('respWriteEx = ' + respWriteEx);
                      console.log('statusWriteEx = '+ statusWriteEx);
                          if(errorWirteEx)
                          {
                            resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias read newly created and write already exits = '+respWriteEx;
                            console.log(resMsg);
                            success(res, resMsg);
                          }
                          else {
                            console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created but write DOES NOT EXISTS '+respWriteEx);
                            //put write alias
                            esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'write', body: aliasBodyWrite })
                              .then(function (resp){
                                  resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+ JSON.stringify(resp);
                                  console.log(resMsg);
                                  success(res, resMsg);
                                }, function (error) {
                                  resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error);
                                  console.log(resMsg);
                                  failure(res, resMsg, 500);
                                }); //end putAlias(write)
                          }
                        });
                }, function (error) {
                  resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias read alias could not create. Write not attempted. Error -'+JSON.stringify(error);
                  console.log(resMsg);
                  failure(res, resMsg, 500);
                }); //end put read alias
              } //end Else
          }); //end existsAlias(read)
}


//Check through Postman
//Alis = https://iad1-10914-0.es.objectrocket.com:20914/_alias/*
//index = https://iad1-10914-0.es.objectrocket.com:20914/banks*
function handlePOST (req, res, esClient ) {
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside handlePOST(user)');
   console.log('req.body.user = '+JSON.stringify(req.body.user));

   var routingValue = req.body.user.uid;
   var indexType = 'banks';
   var userBody = req.body.user;

   if(userBody === null || userBody === undefined) {
    resMsg = "Error: req.query.userBody required to create Index in ES ->" + userBody;
    console.log(resMsg);
    failure(res, resMsg, 404);
   }

   if(routingValue === null || routingValue === undefined) {
    resMsg = "Error: req.query.routingValue required to create Index in ES ->" + routingValue;
    console.log(resMsg);
    failure(res, resMsg, 404);
   }
   resMsg = 'Index not created';

   esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				failure(res, 'Error: elasticsearch cluster is down! -> ' + error, 500);
			} else {
				console.log('Elasticsearch Instance on ObjectRocket Connected!');
			}
	});
	//check elasticsearch health
	esClient.cluster.health({},function(err,resp,status) {
		  console.log("-- esClient Health --",resp);
	});

  var indexName = null;
  var aliasToken = null;
  var termValue = null;
  resMsg = 'Error - No Alias Created for ['+indexName+']';

  console.log('Checking if ['+indexName+'] Exists');
  // do not change the termValue as it is the property of index defined in the template
  if(indexType.includes('banks'))
    { aliasToken = '_banks_'; termValue = "bank_userId_routingAliasId";
      indexName = config.banks_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('coas'))
    { aliasToken = '_coas_'; termValue = "coa_userId_routingAliasId";
      indexName = config.coas_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('customers'))
    { aliasToken = '_customers_'; termValue = "cust_userId_routingAliasId";
      indexName = config.customers_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('invoices'))
    { aliasToken = '_invoices_'; termValue = "inv_userId_routingAliasId";
      indexName = config.invoices_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('notes'))
    { aliasToken = '_notes_'; termValue = "note_userId_routingAliasId";
      indexName = config.notes_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('payments'))
    { aliasToken = '_payments_'; termValue = "pymt_userId_routingAliasId";
      indexName = config.payments_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('rules'))
    { aliasToken = '_rules_'; termValue = "rule_userId_routingAliasId";
      indexName = config.rules_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('suppliers'))
    { aliasToken = '_suppliers_'; termValue = "supp_userId_routingAliasId";
      indexName = config.suppliers_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
  if(indexType.includes('transactions'))
    { aliasToken = '_transactions_'; termValue = "tran_userId_routingAliasId";
      indexName = config.transactions_index_name;
      console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']');
    }
   if(termValue === '' || termValue === null)
     {
     //esClient.close();
     console.log('ERROR - indexType does not contain valid term');
    failure(res, resMsg, 404);;
    }
    if(indexName === null || indexName === undefined) {
     resMsg = "Error: indexName required to create Index in ES ->" + indexName;
     failure(res, resMsg, 404);;
    }

 console.log('AliasToken considered ['+aliasToken+'] and termValue considered ['+termValue+']');
 console.log('Index ['+indexName+'] and routingValue ['+routingValue+']');

 console.log('Checking if index Exists('+ indexName+')');
 esClient.indices.exists({index: indexName})
   .then(function (error,resp) {
     console.log('error value -' + error);
     console.log('response value - ' + resp);
     if(error)
     {
      console.log('Index ['+indexName+'] already exists in ElasticSearch. Response is ->'+error);
      resMsg = 'Index ['+indexName+'] already exists in ElasticSearch -'+JSON.stringify(resp);
      checkAndCreateAlias(indexName, termValue, routingValue, resMsg, aliasToken, req, res, esClient);
     }//end if
     else{
       //index dosen't exist.
        resMsg = 'Index does not Exists!. Can not insert user routingValue to the index. Error Value = '+ error;
        console.log(resMsg);
        failure(res, resMsg, 404);;
     }
   });//end then - indices.exists()

}

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

/* req.body.user = user
{
	"displayName": "Ramhigh Low",
	"email": "testbizvv@gmail.com",
	"emailVerified": true,
	"metadata": {
		"creationTime": "2017-10-27T00:16:16Z",
		"lastSignInTime": "2017-10-27T00:16:16Z"
	},
	"photoURL": "https://lh5.googleusercontent.com/-7k6JG8RCtRI/AAAAAAAAAAI/AAAAAAAAAAc/aKrbE08MqDI/photo.jpg",
	"providerData": [{
		"displayName": "Ramhigh Low",
		"email": "testbizvv@gmail.com",
		"photoURL": "https://lh5.googleusercontent.com/-7k6JG8RCtRI/AAAAAAAAAAI/AAAAAAAAAAc/aKrbE08MqDI/photo.jpg",
		"providerId": "google.com",
		"uid": "106907019373764493113"
	}],
	"uid": "MePBMojfc4hXaM5x490hWAcxsIs2"
}
*/
