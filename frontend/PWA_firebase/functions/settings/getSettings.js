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

//https://us-central1-bizrec-dev.cloudfunctions.net/getSettingsFunction?uid=HJIOFS#53345DD&page=0&size=10
//no body {}
function handleGET (req, res, esClient)
{
  // Do something with the GET request
   var resMsg = '';
   console.log('Inside serer.post(getSettings())');
   console.log('req.query.uid = ' + req.query.uid);
   console.log('req.query.page = ' + req.query.page);
   console.log('req.query.size = ' + req.query.size);
   var routingUid = req.query.uid;
   var page = req.query.page;
   var sizeVal = req.query.size;
   var fromVal = 0;

   if(routingUid === null || routingUid === undefined) {
    resMsg = "Error: req.query.routingUid required to create Index in ES ->" + routingUid;
    helper.failure(res,resMsg,401);
   }
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

  console.log('Checking if index Exists('+config.settings_index_name+')');
  esClient.indices.exists({index: config.settings_index_name})
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
              query: {
                   match: {
                     [configUser.usr_uid] : routingUid
                   }
                 }
            }
       };
       console.log('queryBodyCheckUserExists (JSON) is->'+JSON.stringify(queryBodyCheckUserExists));
       esClient.search(queryBodyCheckUserExists)
         .then(function (respUserCheck) {
           //check hits if there are any user records!
           console.log('hits.total =' + respUserCheck.hits.total);
           if(respUserCheck.hits.total === 0){
             //user doesn't exists
             console.log('User does not exists in user index. - '+ JSON.stringify(respUserCheck));
             resMsg = 'Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error;
             helper.failure(res,resMsg,500);
             }
             else if(respUserCheck.hits.total === 1 ){
               //only one record for the user. Update the user record for the user.uid
               console.log('User exists in user index. Updating now! - '+ JSON.stringify(respUserCheck));
               var hits = respUserCheck.hits.hits;
               console.log('hits object - '+ JSON.stringify(hits[0]));
               //User Uid exists
               var indexAliasName = routingUid+config.settings_alias_token_read;
               console.log('Alias name derived through routing is ->'+indexAliasName);
               var queryBody = {
                 index: indexAliasName,
                 type: config.index_base_type,
                 body: {
                   from: fromVal,
                   size: Number(sizeVal),
                   sort: [
                        { [config.settings_record_updated_column_name]: { order: 'desc' } }
                      ]
                  }
               };
               console.log('getSettings search DSL -> ' + JSON.stringify(queryBody));
               esClient.search(queryBody)
               .then(function (resp) {
                   resMsg = 'settings Data Retrieved Successfully!' ;
                   console.log(resMsg);
                   helper.success(res,resp.hits.hits);
                   },
                     function (error) {
                       resMsg = 'Error : settings document read ['+indexAliasName+'] Failed!' + JSON.stringify(error);
                         helper.failure(res,resMsg,500);
                   });
               }
             else{
               //user has multiple records. Delete rest!
               console.log('Too many copies of the user present! Contact System Adminstrator!');
               console.log('*****');
               console.log(JSON.stringify(respUserCheck));
               console.log('*****');
               resMsg = 'Error : Too many user records found ['+config.user_index_write_alias_name+']! Duplicate records of the user exists. Conctact System Adminstrator.' + error;
               helper.failure(res,resMsg,500);
             }
         }, function (error) {
                 resMsg = 'Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error;
                 helper.failure(res,resMsg,500);
             });//End: check user exists
      }//end if
      else {
        //index dosen't exist. Create one.
         resMsg = 'coa Index does not Exists!. Error Value = '+JSON.stringify(err);
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