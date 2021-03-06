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

function handleDELETE (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handlePOST (req, res, esClient) {
  // Do something with the POST request
  //https://us-central1-bizrec-dev.cloudfunctions.net/createIndexFunction?indexName=users_index_v1&templateType=users
  //no body {}
  //https://us-central1-bizrec-dev.cloudfunctions.net/createIndexFunction?indexName=payments_index_v1&templateType=payments
   var resMsg = '';
   console.log('Inside serer.post(addTemplatetoES)');
   console.log('req.query. = ' + JSON.stringify(req.query.indexName));
   console.log('req.query.templateType = ' + JSON.stringify(req.query.templateType));
   var indexName = req.query.indexName;
   var templateType = req.query.templateType;

   if(indexName === null || indexName === undefined) {
    resMsg = "Error: req.query.indexName required to create Index in ES ->" + indexName;
    helper.failure(res,resMsg,401);
   }
   if(templateType === null || templateType === undefined) {
    resMsg = "Error: req.query.templateType required to create Index in ES ->" + templateType;
    helper.failure(res,resMsg,401);
   }
   indexName = indexName.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_').toLowerCase().trim();
   templateType = templateType.trim().toLowerCase();
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

  //check if index creation is within data model
  switch (templateType) {
      case "banks":
        console.log('indexName ['+indexName+'] will use Banks Template');
        break;
      case "coas":
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
      case "settings":
            console.log('indexName ['+indexName+'] will use settings Template');
            break;
      default:
            console.log('Error: no matching templateType specified for the indexName ['+indexName+']');
            helper.failure(res,'Error: no matching templateType specified for the indexName ['+indexName+']',404);
    }//end switch

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists( { index : indexName } )
		 .then(function (error,resp) {
        //index exists check
        console.log('error value -' + error);
        console.log('response value - ' + resp);

        if(error){
          console.log('Index ['+indexName+'] already exists in ElasticSearch. Response is ->'+resp);
  				//check if mapping exists
  				esClient.indices.getMapping({index: indexName})
  					.then(function (response) {
  							resMsg = 'Mapping ['+indexName+'] already exists. Start creating documents. ' + JSON.stringify(response);
  							helper.success(res,resMsg);
  					},function (error){//mapping doesn't exists
  						console.log('Mapping ['+indexName+'] Not created. Before use create mapping' + JSON.stringify(error));
  						resMsg = 'Mapping ['+indexName+'] Not created. Before use create mapping'+ error;
  						helper.success(res,resMsg);
  				});//end indices.getMapping()
        } // end if
        else {
         //index dosen't exist. Create one.
    			console.log('Index does not Exists! ... Creating ['+indexName+'] now! Error value is ->'+ error);
    			esClient.indices.create({index: indexName})
    				.then(function (errorCreate, responseCreate) {
                  console.log('Creating Index - errorCreate value is = ' + errorCreate);
                  console.log('Create Index - responseCreate value is =' + responseCreate);
                  if(errorCreate){
                    console.log('Index ['+indexName+'] Created! Before use create mapping -> ' + JSON.stringify(errorCreate));
      						  resMsg = 'Index ['+indexName+'] Created with standard template mapping. Flag =' + JSON.stringify(errorCreate);
       						  helper.success(res,resMsg);
                  }
                  else{
                    console.log('Error: creating index ['+indexName+'] -> ' + errorCreate);
        						resMsg = 'Error: creating index ['+indexName+']' + errorCreate;
        						helper.failure(res,resMsg,500);
                  }
    					});//end then - create()
             } //end else
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
