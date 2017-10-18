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

//https://us-central1-bizrec-dev.cloudfunctions.net/createInvoiceFunction?uid=HJIOFS#53345DD
//no body {} -- invoice body
function handlePOST (req, res)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(createInvoice)');
   console.log('req.query.uid = ' + JSON.stringify(req.query.uid));
   console.log('req.query.inoiceData = ' + JSON.stringify(req.body.invoiceData));
   var routingUid = req.query.uid;
   var invoiceData = req.query.invoiceData;

   if(routingUid === null || routingUid === undefined) {
    resMsg = "Error: req.query.routingUid required to create Index in ES ->" + routingUid;
    failure(res,resMsg,401);
   }
   if(invoiceData === null || invoiceData === undefined) {
    resMsg = "Error: req.query.invoiceData required to create Index in ES ->" + invoiceData;
    failure(res,resMsg,401);
   }
   resMsg = 'Data not indexed in ES';

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

	 console.log('Checking if index Exists('+config.invoices_index_name+')');
	 esClient.indices.exists(config.invoices_index_name)
		 .then(function (resp) {
        //index exists
				console.log('Index ['+config.invoices_index_name+'] already exists in ElasticSearch. Response is ->'+resp);
				resMsg = 'Index ['+config.invoices_index_name+'] already exists in ElasticSearch'+JSON.stringify(resp);
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
                //Insert invoice to the index
                var indexAliasName = routingUid+config.invoices_alias_token_write;
                console.log('Alias name derived through routing is ->'+indexAliasName);
                queryBody = {
                  index: indexAliasName,
                  type: config.index_base_type,
                  body: invoiceData
                };
                esClient.index(queryBody)
                .then(function (resp) {
                    res_msg = 'Invoice Data Indexed Successfully!' ;
                    //esClient.close(); //use in lambda only
                    helper.success(res,next,res_msg);
                    },
                      function (error) {
                        res_msg = 'Error : Invoice document insert ['+indexAliasName+'] Failed!' + JSON.stringify(error);
                        //esClient.close(); //use in lambda only
                      helper.failure(res,next,res_msg,500);
                });
            }, function (error) {
                res_msg = 'Error : User not found in user Index. Error - ' + JSON.stringify(error);
                //esClient.close(); //use in lambda only
                helper.failure(res,next,res_msg,500);
          });//End: check user exists
	     }, function (err){
         //index dosen't exist. Create one.
    			console.log('Index does not Exists! Can not insert invoice. Error value is ->'+JSON.stringify(err));
    			resMsg = 'Index does not Exists!. Error Value = '+JSON.stringify(err);
          failure(res,resMsg,404);
	    });//end then - indices.exists()

}

exports.handler = function(req, res, database)
{
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
