'use strict';

var config  = require('../config.js');
var configUser  = require('../config/specific/user_template_columns.js');
var helper = require('../config/helpers/helper.js');

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

//https://us-central1-bizrec-dev.cloudfunctions.net/getTransactionsFunction?page=0&size=10
//no body {}
function handleGET (req, res, esClient)
{
  // Do something with the GET request
   var resMsg = '';
   console.log('Inside serer.post(getUsers())');
   console.log('req.query.page = ' + req.query.page);
   console.log('req.query.size = ' + req.query.size);
   var page = req.query.page;
   var sizeVal = req.query.size;
   var fromVal = 0;

   if(sizeVal == null || sizeVal === undefined)
      sizeVal = 10;
   if(page === null || page === undefined)
      fromVal = 0;
   else
      fromVal  = page * Number(sizeVal);

  console.log('sizeVal = '+sizeVal+' , page ='+page+" , fromVal = "+fromVal);

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

  console.log('Checking if index Exists('+config.user_index_name+')');
  esClient.indices.exists({index: config.user_index_name})
    .then(function (error,resp) {
      console.log('error value -' + error);
      console.log('response value - ' + resp);
      if(error)
      {
       console.log('Index ['+config.user_index_name+'] already exists in ElasticSearch. Response is ->'+error);
       resMsg = 'Index ['+config.user_index_name+'] already exists in ElasticSearch. Checking if user record exists -'+JSON.stringify(resp);

       //check if uid exists
       //check if UID exists in users index using global_alisas_for_search_users_index
       var queryBodyCheckUserExists = {
            index : config.user_index_search_alias_name,
            type : config.index_base_type,
            body: {
              from: fromVal,
              size: Number(sizeVal),
              query: {
                   match_all: {}
                 }
            }
       };
       console.log('queryBodyCheckUserExists (JSON) is->'+JSON.stringify(queryBodyCheckUserExists));
       esClient.search(queryBodyCheckUserExists)
         .then(function (respUserCheck) {
           //check hits if there are any user records!
           console.log('hits.total =' + respUserCheck.hits.total);
           helper.success(res,resp.hits.hits);
            }, function (error) {
                 resMsg = 'Error : User does not exists in database ['+config.user_index_search_alias_name+']. Contact System Adminstrator.' + error;
                 helper.failure(res,resMsg,500);
             });//End: check user exists
      }//end if
      else {
        //index dosen't exist. Create one.
         resMsg = 'User Index does not Exists!. Error Value = '+JSON.stringify(err);
         console.log(resMsg);
         helper.failure(res,resMsg,404);
      } // end else - index doesn't exist
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
