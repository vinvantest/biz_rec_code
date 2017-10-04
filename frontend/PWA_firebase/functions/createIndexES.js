'use strict';

var elasticsearch = require('elasticsearch');

function _respond(res, status, data, http_code) {
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
     res.status(http_code).send(response);
}

function _respondArray(res, status, data, http_code) {
   var response = {
      'data' : [data]
     }
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
    res.status(http_code).send(response);
}

function success(res, data){
 _respond(res, 'success', data, 200);
}

function successArray(res,data){
 _respondArray(res, 'success', data, 200);
}

function failure(res, data, http_code){
 console.log('Error: ' + http_code + ' ' + data);
 _respond(res, 'failure', data, http_code);
}

function handlePOST (req, res) {
  // Do something with the GET request

	console.log('Inside createIndex() Lambda Function and Paramter passed -' + req.query.indexName);
	 var indexName = req.query.indexName;
	 if(indexName === null || indexName === undefined)
   {
     let res_msg = "Error: req.params.indexName required to create Index in ES ->" + indexName;
     failure(res,res_msg,500);
   }
	 var docType = req.body.docType;
	 if(docType  === null || docType === undefined)
   {
     let res_msg = "Error: req.query.docType required to create Index mappings in ES ->" + docType;
     failure(res,res_msg,500);
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

	 var res_msg = 'Index not created';

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists(indexName)
		 .then(function (response) {//index exists
				console.log('Index ['+indexName+'] already exists in ElasticSearch');
				res_msg = 'Index ['+indexName+'] already exists in ElasticSearch';
				//check if mapping exists
				esClient.indices.getMapping({index: indexName})
					.then(function (response){
						res_msg = 'Mapping ['+indexName+'] already exists. Start calling Index.save()';
            esClient.close();
            success(res,res_msg);
					},
					function (error) {
						//mapping doesn't exists
						console.log('Mapping ['+indexName+'] Not created. Creating Now! -> ' + JSON.stringify(error));
						res_msg = 'Mapping ['+indexName+'] Not created. Creating Now!';// + JSON.stringify(error);
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
						res_msg = 'Index ['+indexName+'] existed but mapping now inserted';
            esClient.close();
            success(res,res_msg);
					});//end indices.getMapping()
	     }, function (err){ //index dosen't exist. Create one.
			 console.log('Index ['+indexName+'] does not exists!');
			console.log('Creating ['+indexName+'] now! Error value is ->'+JSON.stringify(err));
			res_msg = 'Creating ['+indexName+'] now!'; //+JSON.stringify(err);
			esClient.indices.create({index: indexName})
				.then(function (response) {
					console.log('Index ['+indexName+'] Created! Now putting mapping -> '+ JSON.stringify(response));
						res_msg = 'Index ['+indexName+'] Created! Now putting mapping'; //+JSON.stringify(response);
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
						res_msg = 'Index ['+indexName+'] Created with mapping';
            esClient.close();
            success(res,res_msg);
					}, function (error) {
						console.log('Error: creating index ['+indexName+'] -> ' +JSON.stringify(error));
						res_msg = 'Error: creating index ['+indexName+']'; // + JSON.stringify(error);
            esClient.close();
            failure(res,res_msg,500);
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

exports.handler = function(req, res, database) {
//get lambda api event body template params
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('Params:', req.params);
  console.log('Path Prams:', req.path);
  console.log('Query:', req.query);

  let usersRef = database.ref('users');
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
}