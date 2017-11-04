'use strict';

var helper = require('../config/helpers/helper.js');

var config  = require('../config.js');

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

function checkAndCreateAlias(req, res, resp, indexName, termValue, routingValue, resMsg, esClient)
{
  console.log('index ['+config.user_index_search_alias_name+'] includes user with UUID ['+routingValue+']. Creating Alias for index ['+indexName+']!');
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

  //e.g. name: 2344d4523sdg4_banks_read
  esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'read'})
    .then( function (respReadExists) {
      if(respReadExists)
      {
        console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias['+routingValue + aliasToken + 'read'+'] for read exists checking if write exists'+respReadExists);
        //checking wirte alias exists
        esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'write'})
              .then( function (respWriteExists) {
                if(respWriteExists)
                {
                  console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read and Write already EXISTS '+respWriteExists);
                  resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias ['+routingValue + aliasToken + 'read'+'] and ['+routingValue + aliasToken + 'write'+'] Read and Write already EXISTS = '+respWriteExists;
                   //esClient.close();
                  helper.success(res,resMsg);
                }
                else {
                  console.log('Index ['+indexName+'] exists in ElasticSearch Alias for read exists ['+routingValue + aliasToken + 'read'+'] AND Alias write DOES NOT EXISTS. Creating now! response value ='+respWriteExists);
                  //put write alias
                  esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'write', body: aliasBodyWrite })
                    .then(function (resp){
                        console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias ['+routingValue + aliasToken + 'write'+'] write created as read already existed = '+resp);
                        resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias ['+routingValue + aliasToken + 'write'+'] write created as read already existed = '+resp;
                         //esClient.close();
                        helper.success(res,resMsg);
                      }, function (error) {
                        console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error));
                        resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error);
                         //esClient.close();
                        helper.failure(res,resMsg,500);
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
                  esClient.indices.existsAlias({index: indexName, name: routingValue + aliasToken + 'write'})
                        .then( function (respWriteEx) {
                          if(respWriteEx)
                          {
                            console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created and write already exits '+respWriteEx);
                            resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias read newly created and write already exits = '+respWriteEx;
                             //esClient.close();
                            helper.success(res,resMsg);
                          }
                          else {
                            console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created but write DOES NOT EXISTS '+respWriteEx);
                            //put write alias
                            esClient.indices.putAlias({index: indexName, name: routingValue + aliasToken + 'write', body: aliasBodyWrite })
                              .then(function (resp){
                                  console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+resp);
                                  resMsg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+resp;
                                   //esClient.close();
                                  helper.success(res,resMsg);
                                }, function (error) {
                                  console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error));
                                  resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error);
                                   //esClient.close();
                                  helper.failure(res,resMsg,500);
                                }); //end putAlias(write)
                          }
                        });
                }, function (error) {
                  console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias read not created so did not check write-'+JSON.stringify(error));
                  resMsg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias read created so did not check write-'+JSON.stringify(error);
                   //esClient.close();
                  helper.failure(res,resMsg,500);
                }); //end put read alias
              }
          }); //end existsAlias(read)
}

//https://us-central1-bizrec-dev.cloudfunctions.net/createIndexAliasBasedOnRoutingFunction?routingValue=UUID&indexType=banks
//1. body {} send users object {user}
//2. indexType = 'users' is not valid
function handlePOST (req, res, esClient) {
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(addTemplatetoES)');
   console.log('req.query.routingValue = ' + JSON.stringify(req.query.routingValue));
   console.log('req.query.routingValue = ' + JSON.stringify(req.query.indexType));
   console.log('req.body.users = ' + JSON.stringify(req.body.users));

   var routingValue = req.query.routingValue;
   var indexType = req.query.indexType;
   var usersBody = req.body.users;


   if(routingValue === null || routingValue === undefined) {
    resMsg = "Error: req.query.routingValue required to create Index in ES ->" + routingValue;
    helper.failure(res,resMsg,401);
   }
   if(indexType === null || indexType === undefined) {
    resMsg = "Error: req.query.routingValue required to create Index in ES ->" + routingValue;
    helper.failure(res,resMsg,401);
   }
   if(usersBody === null || usersBody === undefined) {
    resMsg = "Error: req.body.usersBody required to create Alias if UID is not in users index in ES ->" + routingValue;
    helper.failure(res,resMsg,401);
   }
   //indexName = indexName.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_').toLowerCase().trim();
   routingValue = routingValue.trim().toLowerCase();
   indexType = indexType.trim().toLowerCase();
   console.log('var indexName after conversion = [' + indexName + ']');
   resMsg = 'Index not created';

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
  var indexName = null;
  var aliasToken = null;
  var termValue = null;

  //if(routingValue.isEmail())
  //routingValue = routingValue.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_');
  var resMsg = 'Error - No Alias Created for ['+indexName+']';
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
     helper.failure(res,'indexType does not contain valid term',401);
    }
    if(indexName === null || indexName === undefined) {
     resMsg = "Error: indexName required to create Index in ES ->" + indexName;
     helper.failure(res,resMsg,401);
    }

 console.log('AliasToken considered ['+aliasToken+'] and termValue considered ['+termValue+']');
 console.log('Index ['+indexName+'] and routingValue ['+routingValue+']');

 console.log('Checking if index exists');
 esClient.indices.exists({index: indexName})
    .then(function (exists)
           {
             console.log('inside function index(exists) with exists value ->'+exists+'<-');
             if(exists)
             { //index exists //Create Alias on routing & term filter customer_uid_for_alias
               console.log('Index ['+indexName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists));
               resMsg = 'Index ['+indexName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists);

                       /*********************
                       * CHECK UID present
                       *******************/
               //check if UID exists in users index using global_alisas_for_search_users_index
               var queryBody = {
                        index : config.user_index_search_alias_name,
                        type : 'base_type',
                        usr_uid : routingValue
                      };
               esClient.get(queryBody)
                 .then(function (resp){
                      checkAndCreateAlias(req,res, resp, indexName, termValue, routingValue, resMsg);
                    }, function (error) {
                           //user uid is not present in user index. Create it.
                                   /****************
                                   * Insert User into usr index to further create aliases
                                   ***************/
                              esClient.index({
                                  index: config.user_index_write_alias_name,
                                  type: config.index_base_type,
                                  //id: '1', //auto generate one id = AV42nEv9o_vzDBnnlJzI
                                  body: usersBody
                              })
                              .then(function (resp) {
                                  resMsg = 'User was not in Index hence Added to Index['+indexAliasName+']. Resubmit the request!' ;
                                  checkAndCreateAlias(req,res, resp, indexName, termValue, routingValue, resMsg);
                                  },
                                    function (error) {
                                      resMsg = 'Error : User was not in Index. Document insert ['+indexAliasName+'] Failed!' + JSON.stringify(error);
                                      //esClient.close(); //use in lambda only
                                      helper.helper.failure(res,next,resMsg,500);
                              });
                         }); //end search()
                 }//end if index Exists -- to be deleted
                 else {
                   //index dosen't exist
                   console.log('Index ['+indexName+'] does not exist! Error value is ->'+JSON.stringify(exists));
                   resMsg = 'Index ['+indexName+'] does not exists!'+JSON.stringify(exists);
                    //esClient.close();
                    helper.failure(res,resMsg,404);
                 }//end else index exists
    }); //end then - indices.exists()

}

exports.handler = function(req, res, database, esClient) {
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
      handlePOST(req, res, esClient);
      break;
  case 'DELETE':
       handleDELETE(req, res);
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
