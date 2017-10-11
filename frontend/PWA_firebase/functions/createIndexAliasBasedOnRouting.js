'use strict';

var esClient = require('./config/elasticsearch/elasticConfig.js');
var config  = require('./config.js');

function handleGET (req, res) {
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

function _respond(res, status, data, httpCode) {
     var response = {
       'status': status,
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

function handlePOST (req, res) {
  // Do something with the GET request
  //https://us-central1-bizrec-dev.cloudfunctions.net/addTemplateToESFunction?indexName=usr_index_v1&routingValue=UUID&indexType=banks
  //no body {} // indexType = users not valid
   var resMsg = '';
   console.log('Inside serer.post(addTemplatetoES)');
   console.log('req.query. = ' + JSON.stringify(req.query.indexName));
   console.log('req.query.routingValue = ' + JSON.stringify(req.query.routingValue));
   console.log('req.query.routingValue = ' + JSON.stringify(req.query.indexType));
   var indexName = req.query.indexName;
   var routingValue = req.query.routingValue;
   var indexType = req.query.indexType;

   if(indexName === null || indexName === undefined) {
    resMsg = "Error: req.query.indexName required to create Index in ES ->" + indexName;
    failure(res,resMsg,401);
   }
   if(routingValue === null || routingValue === undefined) {
    resMsg = "Error: req.query.routingValue required to create Index in ES ->" + routingValue;
    failure(res,resMsg,401);
   }
   if(indexType === null || indexType === undefined) {
    resMsg = "Error: req.query.routingValue required to create Index in ES ->" + routingValue;
    failure(res,resMsg,401);
   }
   indexName = indexName.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_').toLowerCase().trim();
   routingValue = routingValue.trim().toLowerCase();
   indexType = indexType.trim().toLowerCase();
   console.log('var indexName after conversion = [' + indexName + ']');
   resMsg = 'Index not created';

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

  var aliasToken = null;
  var termValue = null;
  console.log('Index ['+indexName+'] and routingValue ['+routingValue+']');
  //if(routingValue.isEmail())
  //routingValue = routingValue.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_');
  var resMsg = 'Error - No Alias Created for ['+indexName+']';
  console.log('Checking if ['+indexName+'] Exists');
  if(indexType.includes('banks'))
    { aliasToken = '_banks_'; termValue = "bank_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('coa'))
    { aliasToken = '_coa_'; termValue = "coa_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('customers'))
    { aliasToken = '_customers_'; termValue = "cust_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('invoices'))
    { aliasToken = '_invoices_'; termValue = "inv_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('notes'))
    { aliasToken = '_notes_'; termValue = "note_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('payments'))
    { aliasToken = '_payments_'; termValue = "pymt_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('rules'))
    { aliasToken = '_rules_'; termValue = "rule_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('suppliers'))
    { aliasToken = '_suppliers_'; termValue = "supp_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
  if(indexType.includes('transactions'))
    { aliasToken = '_transactions_'; termValue = "tran_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(termValue === '' || termValue === null)
     {
     //esClient.close();
     console.log('ERROR - indexType does not contain valid term');
     failure(res,'indexType does not contain valid term',401);
    }

 console.log('AliasToken considered ['+aliasToken+'] and termValue considered ['+termValue+']');
 console.log('Checking if index exists');
 esClient.indices.exists({index: indexName})
    .then(function (exists)
           {
             console.log('inside function(exists) with exists value ->'+exists+'<-');
             if(exists)
             { //index exists //Create Alias on routing & term filter customer_uid_for_alias
               console.log('Index ['+indexName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists));
               resMsg = 'Index ['+indexName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists);
               //check if UUID exists in users index using global_alisas_for_search_users_index
               var queryBody = { index : config.user_index_search_alias_name , type : 'base_type', id : routingValue };
               //now search for the record for user to exists in database
               esClient.get(queryBody)
                 .then(function (resp){
                   console.log('index ['+indexName+'] includes user with UUID ['+routingValue+']. Creating Alias!');
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

                   esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'read'})
                     .then( function (respReadExists) {
                       if(respReadExists)
                       {
                         console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read exists checking if write exists'+respReadExists);
                         //checking wirte alias exists
                         esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'write'})
                               .then( function (respWriteExists) {
                                 if(respWriteExists)
                                 {
                                   console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read and Write already EXISTS '+respWriteExists);
                                   resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias read and Write already EXISTS = '+respWriteExists;
                                    //esClient.close();
                                   success(res,resMsg);
                                 }
                                 else {
                                   console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias write DOES NOT EXISTS '+respWriteExists);
                                   //put write alias
                                   esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'write', body: aliasBodyWrite })
                                     .then(function (resp){
                                         console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias write created as read already existed = '+resp);
                                         resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias write created as read already existed = '+resp;
                                          //esClient.close();
                                         success(res,resMsg);
                                       }, function (error) {
                                         console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error));
                                         resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error);
                                          //esClient.close();
                                         failure(res,resMsg,500);
                                       }); //end putAlias(write)
                                 }
                               });
                       }
                       else {
                         console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read DOES NOT EXISTS'+respReadExists);
                         //put read alias
                         esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'read', body: aliasBodySearch })
                           .then(function (resp){
                                   console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created now checking if write exists = '+resp);
                                   resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created now checking if write exists = '+resp;
                                   //now check if write exists
                                   esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'write'})
                                         .then( function (respWriteEx) {
                                           if(respWriteEx)
                                           {
                                             console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created and write already exits '+respWriteEx);
                                             resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias read newly created and write already exits = '+respWriteEx;
                                              //esClient.close();
                                             success(res,resMsg);
                                           }
                                           else {
                                             console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created but write DOES NOT EXISTS '+respWriteEx);
                                             //put write alias
                                             esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'write', body: aliasBodyWrite })
                                               .then(function (resp){
                                                   console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+resp);
                                                   resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+resp;
                                                    //esClient.close();
                                                   success(res,resMsg);
                                                 }, function (error) {
                                                   console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error));
                                                   resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error);
                                                    //esClient.close();
                                                   failure(res,resMsg,500);
                                                 }); //end putAlias(write)
                                           }
                                         });
                                 }, function (error) {
                                   console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias read not created so did not check write-'+JSON.stringify(error));
                                   resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias read created so did not check write-'+JSON.stringify(error);
                                    //esClient.close();
                                   failure(res,resMsg,500);
                                 }); //end put read alias
                               }
                           }); //end existsAlias(read)
                 }, function (error) {
                   console.log('Error: Index ['+indexName+'] exists in ElasticSearch but get(UUID) failed error -'+JSON.stringify(error));
                   resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but get(UUID) failed error -'+JSON.stringify(error);
                    //esClient.close();
                   failure(res,resMsg,404);
                 }); //end search()
             }//end if index Exists -- to be deleted
             else {
               //index dosen't exist
               console.log('Index ['+indexName+'] does not exist! Error value is ->'+JSON.stringify(exists));
               resMsg = 'Index ['+indexName+'] does not exists!'+JSON.stringify(exists);
                //esClient.close();
                failure(res,resMsg,404);
             }//end else index exists
    }); //end then - indices.exists()

}

exports.handler = function(req, res, database) {
  //server.get('/getUsers/:indexAliasName', function (req, res, next)
	//{
  var usersRef = database.ref('users');
  switch (req.method) {
  case 'GET':
    handleGET(req, res);
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
