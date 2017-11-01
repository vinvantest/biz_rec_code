'use strict';

var config  = require('../config.js');

function handlePOST (req, res) {
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

function successArray (res, data) {
 _respondArray(res, 'success', data, 200);
}

function failure (res, data, httpCode) {
 console.log('Error: ' + httpCode + ' ' + data);
 _respond(res, 'failure', data, httpCode);
}

//https://us-central1-bizrec-dev.cloudfunctions.net/createcustomersFunction?uid=HJIOFS#53345DD
//no body {} -- customers body
function handleGET (req, res, esClient)
{
  // Do something with the GET request
   var resMsg = '';
   console.log('Inside serer.post(getcustomers)');
   console.log('req.query.uid = ' + JSON.stringify(req.query.uid));
   var routingUid = req.query.uid;

   if(routingUid === null || routingUid === undefined) {
    resMsg = "Error: req.query.routingUid required to create Index in ES ->" + routingUid;
    failure(res,resMsg,401);
   }

   resMsg = 'Data not found in index in ES';

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

	 console.log('Checking if index Exists('+config.customers_index_name+')');
	 esClient.indices.exists(config.customers_index_name)
		 .then(function (resp) {
        //index exists
				console.log('Index ['+config.customers_index_name+'] already exists in ElasticSearch. Response is ->'+resp);
				resMsg = 'Index ['+config.customers_index_name+'] already exists in ElasticSearch'+JSON.stringify(resp);
				//check if uid exists
        //check if UID exists in users index using global_alisas_for_search_users_index
        var queryBody = {
                 index : config.user_index_search_alias_name,
                 type : config.index_base_type,
                 usr_uid : routingUid
               };
        esClient.get(queryBody)
          .then(function (resp) {
                //User Uid exists
                //Insert customers to the index
                var indexAliasName = routingUid+config.customers_alias_token_read;
                var columnName = config.customers_routing_column_name ;
                console.log('Alias name derived through routing is ->'+indexAliasName);
                queryBody = {
                  index: indexAliasName,
                  type: config.index_base_type,
                  columnName : routingUid
                };
                //esClient.search(queryBody)
                esClient.get(queryBody)
                .then(function (resp) {
                    resMsg = 'customers Data Retreived Successfully!' ;
                    console.log(resMsg);
                    //esClient.close(); //use in lambda only
                    successArray(res, resp.hits.hits);
                    },
                      function (error) {
                        resMsg = 'Error : customers document read ['+indexAliasName+'] Failed!' + JSON.stringify(error);
                        //esClient.close(); //use in lambda only
                      failure(res,resMsg,500);
                });
            }, function (error) {
                resMsg = 'Error : User not found in user Index. Error - ' + JSON.stringify(error);
                //esClient.close(); //use in lambda only
                failure(res,resMsg,500);
          });//End: check user exists
	     }, function (err){
         //index dosen't exist. Create one.
    			console.log('Index does not Exists! Can not insert customers. Error value is ->'+JSON.stringify(err));
    			resMsg = 'Index does not Exists!. Error Value = '+JSON.stringify(err);
          failure(res,resMsg,404);
	    });//end then - indices.exists()

}

exports.handler = function(req, res, database, esClient)
{
  var usersRef = database.ref('users');
  switch (req.method) {
  case 'GET':
    handleGET(req, res, esClient);
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
