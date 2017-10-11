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
  //https://us-central1-bizrec-dev.cloudfunctions.net/addTemplateToESFunction?templateName=users_template_v1&templateType=users
  //no body {}
   var resMsg = '';
   console.log('Inside serer.post(addTemplatetoES)');
   console.log('req.query.templateName = ' + JSON.stringify(req.query.templateName));
   console.log('req.query.templateType = ' + JSON.stringify(req.query.templateType));
   var templateName = req.query.templateName;
   var templateType = req.query.templateType;

   if(templateName === null || templateName === undefined) {
    resMsg = "Error: req.query.templateName required to create Index in ES ->" + templateName;
    failure(res,resMsg,401);
   }
   if(templateType === null || templateType === undefined) {
    resMsg = "Error: req.query.templateType required to create Index in ES ->" + templateType;
    failure(res,resMsg,401);
   }

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

   var templateBody;
   console.log('loading xxx_template.json file ....');
   switch (templateType) {
     case "banks":
       templateBody = require('./config/templates/banks_template.js');
       break;
      case "coa":
         templateBody = require('./config/templates/chartofaccounts_template.js');
         break;
      case "customers":
         templateBody = require('./config/templates/customers_template.js');
         break;
      case "invoices":
         templateBody = require('./config/templates/invoices_template.js');
         break;
      case "notes":
         templateBody = require('./config/templates/notes_template.js');
         break;
      case "payments":
         templateBody = require('./config/templates/payments_template.js');
         break;
      case "rules":
         templateBody = require('./config/templates/rules_template.js');
         break;
      case "suppliers":
         templateBody = require('./config/templates/suppliers_template.js');
         break;
      case "transactions":
         templateBody = require('./config/templates/transactions_template.js');
         break;
      case "users":
         templateBody = require('./config/templates/users_template.js');
         break;
      default:
         resMsg = 'Error: no matching templateType specified';
         failure(res,resMsg,404);
   }
   console.log('template.json file Loaded !');

   //console.log(JSON.stringify(templateBody));
   resMsg = 'Error - Template Not Created !';
	console.log('Checking if template Exists');

	 esClient.indices.getTemplate({name: templateName})
		 .then(function (resp) {//template exists
      				console.log('Template ['+templateName+'] already exists in ElasticSearch. Updating tempalate now ->'+JSON.stringify(resp));
              resMsg = 'Template ['+templateName+'] already exists in ElasticSearch. Updating template now';
              //esClient.close(); //close it in lambda for local host don't close it
              esClient.indices.putTemplate({name: templateName, body: templateBody})
      				.then(function (response) {
      					  console.log('template ['+templateName+'] Updated! '+ JSON.stringify(response));
      						resMsg = 'Template ['+templateName+'] Updated!';
      						//esClient.close(); //close it in lambda for local host don't close it
      						success(res,resMsg);
      					}, function (error) {
      						console.log('Error: Updating template ['+templateName+'] -> '+JSON.stringify(error));
      						resMsg = 'Error:  Updating template ['+templateName+']'+JSON.stringify(error);
      						//esClient.close(); //close it in lambda for local host don't close it
      						failure(res,resMsg + ' - ' + error,500);
      					});
     }, function (err){ //template dosen't exist. Create one.
			console.log('Creating ['+templateName+'] now! Error value is ->'+JSON.stringify(err));
			resMsg = 'Creating ['+templateName+'] now!'+JSON.stringify(err);
				esClient.indices.putTemplate({name: templateName, body: templateBody})
				.then(function (response) {
					  console.log('template ['+templateName+'] Created! '+ JSON.stringify(response));
						resMsg = 'Template ['+templateName+'] Created!';
						//esClient.close(); //close it in lambda for local host don't close it
						success(res,resMsg);
					}, function (error) {
						console.log('Error: putting template ['+templateName+'] -> ' +JSON.stringify(err));
						resMsg = 'Error:  putting template ['+templateName+']'+JSON.stringify(err);
						//esClient.close(); //close it in lambda for local host don't close it
						failure(res,resMsg + ' - ' + error,500);
					});
	    });//end then - indices.getTemplate()

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
