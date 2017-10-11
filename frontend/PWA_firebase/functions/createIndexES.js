'use strict';

var elasticsearch = require('elasticsearch');
var config  = require('./config.js');

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

function success(res, data){
 _respond(res, 'success', data, 200);
}

function successArray(res,data){
 _respondArray(res, 'success', data, 200);
}

function failure(res, data, httpCode){
 console.log('Error: ' + httpCode + ' ' + data);
 _respond(res, 'failure', data, httpCode);
}

function handlePOST (req, res) {
  // Do something with the GET request

	console.log('Inside createIndex() Lambda Function and Paramter passed -' + req.query.indexName);
	 var indexName = req.query.indexName;
	 if(indexName === null || indexName === undefined)
   {
     var resMsgErr = "Error: req.params.indexName required to create Index in ES ->" + indexName;
     failure(res,resMsgErr,500);
   }
	 var docType = req.body.docType;
	 if(docType  === null || docType === undefined)
   {
     var resMsgDct = "Error: req.query.docType required to create Index mappings in ES ->" + docType;
     failure(res,resMsgDct,500);
   }


	var auth = 'vintest:test1234';
	var port = 20914;
	var protocol = 'https';
	var log = 'trace';
	var hostUrls = [
				'iad1-10914-0.es.objectrocket.com',
				'iad1-10914-1.es.objectrocket.com',
				'iad1-10914-2.es.objectrocket.com',
				'iad1-10914-3.es.objectrocket.com'
		  ];
	var hosts = hostUrls.map(function(host) {
		return {
			protocol: protocol,
			host: host,
			port: port,
			auth: auth,
			log: log
		};
	});
	var esClient = new elasticsearch.Client({
		hosts: hosts
	});


  esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				failure(res,'Error: elasticsearch cluster is down! -> '+error, 500);
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

	 var resMsg = 'Index not created';

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists(indexName)
		 .then(function (response) {//index exists
				console.log('Index ['+indexName+'] already exists in ElasticSearch');
				resMsg = 'Index ['+indexName+'] already exists in ElasticSearch';
				//check if mapping exists
				esClient.indices.getMapping({index: indexName})
					.then(function (response){
						resMsg = 'Mapping ['+indexName+'] already exists. Start calling Index.save()';
            esClient.close();
            success(res,resMsg);
					},
					function (error) {
						//mapping doesn't exists
						console.log('Mapping ['+indexName+'] Not created. Creating Now! -> ' + JSON.stringify(error));
						resMsg = 'Mapping ['+indexName+'] Not created. Creating Now!';// + JSON.stringify(error);
						esClient.indices.putMapping({
									index: indexName,
									type: docType, //"test_type_table1"
									body: //payload //below not required if JSON object passed to create mapping
										{
										properties: {
											title: { type: "string" },
											content: { type: "string" }
											}
										}
									});
						resMsg = 'Index ['+indexName+'] existed but mapping now inserted';
            esClient.close();
            success(res,resMsg);
					});//end indices.getMapping()
	     }, function (err){ //index dosen't exist. Create one.
			 console.log('Index ['+indexName+'] does not exists!');
			console.log('Creating ['+indexName+'] now! Error value is ->'+JSON.stringify(err));
			resMsg = 'Creating ['+indexName+'] now!'; //+JSON.stringify(err);
			esClient.indices.create({index: indexName})
				.then(function (response) {
					console.log('Index ['+indexName+'] Created! Now putting mapping -> '+ JSON.stringify(response));
						resMsg = 'Index ['+indexName+'] Created! Now putting mapping'; //+JSON.stringify(response);
						//now create mapping
						esClient.indices.putMapping({
									index: indexName,
									type: docType, //"test_type_table1"
									body: //paylod //below not required if JSON object passed to create mapping
										{
										properties: {
											title: { type: "string" },
											content: { type: "string" }
											}
										}
								});
						console.log('Index ['+indexName+'] Created with mapping for Type ['+docType+']');
						resMsg = 'Index ['+indexName+'] Created with mapping';
            esClient.close();
            success(res,resMsg);
					}, function (error) {
						console.log('Error: creating index ['+indexName+'] -> ' +JSON.stringify(error));
						resMsg = 'Error: creating index ['+indexName+']'; // + JSON.stringify(error);
            esClient.close();
            failure(res,resMsg,500);
					});
	    });//end then - indices.exists()
}

function handlePUT (req, res) {
// Do something with the PUT request
res.status(403).send('Forbidden!');
}

function handleDELETE (req, res) {
// Do something with the PUT request
res.status(403).send('Forbidden!');
}

function handleGET (req, res) {
// Do something with the PUT request
res.status(403).send('Forbidden!');
}

exports.handler = function(req, res, database, config) {
//get lambda api event body template params
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('Params:', req.params);
  console.log('Path Prams:', req.path);
  console.log('Query:', req.query);

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
