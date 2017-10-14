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
  //https://us-central1-bizrec-dev.cloudfunctions.net/addTemplateToESFunction?indexName=users_template_v1&templateType=users
  //no body {}
   var resMsg = '';
   console.log('Inside serer.post(addTemplatetoES)');
   console.log('req.query. = ' + JSON.stringify(req.query.indexName));
   console.log('req.query.templateType = ' + JSON.stringify(req.query.templateType));
   var indexName = req.query.indexName;
   var templateType = req.query.templateType;

   if(indexName === null || indexName === undefined) {
    resMsg = "Error: req.query.indexName required to create Index in ES ->" + indexName;
    failure(res,resMsg,401);
   }
   if(templateType === null || templateType === undefined) {
    resMsg = "Error: req.query.templateType required to create Index in ES ->" + templateType;
    failure(res,resMsg,401);
   }
   indexName = indexName.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_').toLowerCase().trim();
   templateType = templateType.trim().toLowerCase();
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

  //check if index creation is within data model
  switch (templateType) {
      case "banks":
        console.log('indexName ['+indexName+'] will use Banks Template');
        break;
      case "coa":
          console.log('indexName ['+indexName+'] will use Chart Of Accounts Template');
          break;
      case "customers":
          console.log('indexName ['+indexName+'] will use Customers Template');
          break;
      case "invoices":
          console.log('indexName ['+indexName+'] will use Invoices Template');
          break;
      case "notes":
            console.log('indexName ['+indexName+'] will use Notes Template');
            break;
      case "payments":
            console.log('indexName ['+indexName+'] will use Payments Template');
            break;
      case "rules":
            console.log('indexName ['+indexName+'] will use Rules Template');
            break;
      case "suppliers":
            console.log('indexName ['+indexName+'] will use Suppliers Template');
            break;
      case "transactions":
            console.log('indexName ['+indexName+'] will use Transactions Template');
            break;
      case "users":
            console.log('indexName ['+indexName+'] will use Users Template');
            break;
      default:
            console.log('Error: no matching templateType specified for the indexName ['+indexName+']');
            failure(res,'Error: no matching templateType specified for the indexName ['+indexName+']',404);
    }//end switch

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists(indexName)
		 .then(function (resp) {//index exists
				console.log('Index ['+indexName+'] already exists in ElasticSearch. Response is ->'+resp);
				resMsg = 'Index ['+indexName+'] already exists in ElasticSearch'+JSON.stringify(resp);
				//check if mapping exists
				esClient.indices.getMapping({index: indexName})
					.then(function (response) {
							resMsg = 'Mapping ['+indexName+'] already exists. Start creating documents. ' + JSON.stringify(response);
							//esClient.close(); //close it in lambda only
							success(res,resMsg);
					},function (error){//mapping doesn't exists
						console.log('Mapping ['+indexName+'] Not created. Before use create mapping' + JSON.stringify(error));
						resMsg = 'Mapping ['+indexName+'] Not created. Before use create mapping'+ JSON.stringify(error);
						//context.succeed(responder.success(JSON.stringify(resMsg)));
						//esClient.close(); //close it in lambda only
						success(res,resMsg);
				});//end indices.getMapping()
	     }, function (err){ //index dosen't exist. Create one.
			console.log('Index does not Exists! ... Creating ['+indexName+'] now! Error value is ->'+JSON.stringify(err));
			resMsg = 'Creating ['+indexName+'] now!'+JSON.stringify(err);
			esClient.indices.create({index: indexName})
				.then(function (response) {
					    console.log('Index ['+indexName+'] Created! Before use create mapping -> '+ JSON.stringify(response));
						  resMsg = 'Index ['+indexName+'] Created with standard of template mapping.';
              /* Add alias to indexName before inserting documents */
              //you won't know what alias to use in the index ... do it at document insertion
						//context.succeed(responder.success(JSON.stringify(resMsg)));
						//esClient.close(); //close it in lambda only
						success(res,resMsg);
					}, function (error) {
						console.log('Error: creating index ['+indexName+'] -> ' +JSON.stringify(error));
						resMsg = 'Error: creating index ['+indexName+']'+JSON.stringify(error);
						//context.fail(responder.internalServerError('Error: elasticsearch cannot create index and put mapping! -> '+error));
						//esClient.close(); //close it in lambda only
						failure(res,resMsg + ' - ' + error,500);
					});
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