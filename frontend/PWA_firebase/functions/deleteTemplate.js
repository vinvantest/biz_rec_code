'use strict';

var esClient = require('./config/elasticsearch/elasticConfig.js');
//var config  = require('./config.js');

function handleGET (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handlePOST (req, res) {
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

function handleDELETE (req, res) {
  // Do something with the Delete request
  //https://us-central1-bizrec-dev.cloudfunctions.net/deleteIndexFunction?templateName=users_index_v1
  //no body {}
   var resMsg = '';
   console.log('Inside serer.post(deleteTemplate)');
   console.log('req.query.templateName = ' + req.query.templateName);
   var templateName = req.query.templateName;

   if(templateName === null || templateName === undefined) {
    resMsg = "Error: req.query.templateName required to create Index in ES ->" + templateName;
    failure(res,resMsg,401);
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
			// on finish
			//esClient.close();
	});
	//check elasticsearch health
	esClient.cluster.health({},function(err,resp,status) {
		  console.log("-- esClient Health --",resp);
	});

	 console.log('Checking if template Exists('+templateName+')');
	 esClient.indices.getTemplate({name: templateName})
		 .then(function (resp) {
       //index exists
       //delete index
				console.log('Template ['+templateName+'] already exists in ElasticSearch. Response is ->'+resp);
				resMsg = 'Template ['+templateName+'] already exists in ElasticSearch'+ resp;
				//delete the index
				esClient.deleteTemplate({id: templateName})
					.then(function (response) {
							resMsg = 'Delete ['+templateName+'] succesfull' + response;
							//esClient.close(); //close it in lambda only
							success(res,resMsg);
					},function (error){
            //delete index failure
						console.log('Delete '+templateName+'] failed' + JSON.stringify(error));
						resMsg = 'Delete ['+templateName+'] Failed. Try again later! ->'+ error;
  					//esClient.close(); //close it in lambda only
						failure(res,resMsg,500);
				});//end indices.deleteTemplate()
	     }, function (err){
             //index dosen't exist. Create one.
    			  console.log('Template does not Exists! ->'+JSON.stringify(err));
      			resMsg = 'Error: ['+templateName+'] does not exists!' + err;
      			success(res,resMsg);
	  });//end then - indices.exists()

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
