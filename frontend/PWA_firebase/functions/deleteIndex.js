'use strict';

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

function handleDELETE (req, res, esClient) {
  // Do something with the Delete request
  //https://us-central1-bizrec-dev.cloudfunctions.net/deleteIndexFunction?indexName=users_index_v1
  //no body {}
   var resMsg = '';
   console.log('Inside serer.post(deleteIndex)');
   console.log('req.query.indexName = ' + req.query.indexName);
   var indexName = req.query.indexName;

   if(indexName === null || indexName === undefined) {
    resMsg = "Error: req.query.indexName required to create Index in ES ->" + indexName;
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

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists( { index: indexName } )
		 .then(function (error, resp) {
       //index exists
       //delete index
       console.log('response value of error -'+error);
				console.log('Index ['+indexName+'] exists in ElasticSearch. Response is ->'+ resp);

        if(error){
          //delete the index
  				esClient.indices.delete( { index: indexName })
  					.then(function (response) {
  							resMsg = 'Delete ['+indexName+'] succesfull' + JSON.stringify(response);
  							//esClient.close(); //close it in lambda only
  							success(res,resMsg);
  					},function (error){
              //delete index failure
  						console.log('Delete '+indexName+'] failed' + JSON.stringify(error));
  						resMsg = 'Delete ['+indexName+'] Failed. Try again later! ->'+ JSON.stringify(error);
    					//esClient.close(); //close it in lambda only
  						failure(res,resMsg,500);
  				});//end indices.delete()
        }
        else{
          resMsg = 'Index ['+indexName+'] does not exists in ElasticSearch'+ JSON.stringify(error);
          failure(res,resMsg,500);
        }

	     }, function (err){
             //index dosen't exist. Create one.
    			  console.log('Index does not Exists! ->'+JSON.stringify(err));
      			resMsg = 'Error: ['+indexName+'] does not exists!' + JSON.stringify(err);
      			success(res,resMsg);
	  });//end then - indices.exists()

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
      handlePOST(req, res);
      break;
  case 'DELETE':
       handleDELETE(req, res, esClient);
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
