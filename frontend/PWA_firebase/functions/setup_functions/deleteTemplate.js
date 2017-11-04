'use strict';

var helper = require('../config/helpers/helper.js');

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

function handleDELETE (req, res, esClient) {
  // Do something with the Delete request
  //https://us-central1-bizrec-dev.cloudfunctions.net/deleteTemplateFunction?templateName=users_index_v1
  //no body {}
   var resMsg = '';
   console.log('Inside serer.post(deleteTemplate)');
   console.log('req.query.templateName = ' + req.query.templateName);
   var templateName = req.query.templateName;

   if(templateName === null || templateName === undefined) {
    resMsg = "Error: req.query.templateName required to create Index in ES ->" + templateName;
    helper.failure(res,resMsg,401);
   }
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

	 console.log('Checking if template Exists('+templateName+')');
	 esClient.indices.getTemplate({name: templateName})
		 .then(function (resp) {
       //index exists
       //delete index
				console.log('Template ['+templateName+'] already exists in ElasticSearch. Response is ->'+JSON.stringify(resp) );
				//delete the index
				esClient.indices.deleteTemplate({name : templateName})
					.then(function (response) {
							resMsg = 'Delete ['+templateName+'] succesfull' + JSON.stringify(response);
							helper.success(res,resMsg);
					},function (error){
            //delete index failure
						resMsg = 'Delete ['+templateName+'] Failed. Try again later! ->'+ JSON.stringify(error);
            console.log(resMsg);
						helper.failure(res,resMsg,500);
				});//end indices.deleteTemplate()
	     }, function (err){
             //index dosen't exist. Create one.
      			resMsg = 'Error: ['+templateName+'] does not exists!' + JSON.stringify(err);
            console.log(resMsg);
      			helper.failure(res,resMsg, 500);
	  });//end then - getTemplate())

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
