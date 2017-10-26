'use strict';

var esClient = require('./config/elasticsearch/elasticConfig.js');
var config  = require('./config.js');

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

function successArray (res, data) {
 _respondArray(res, 'success', data, 200);
}

function failure (res, data, httpCode) {
 console.log('Error: ' + httpCode + ' ' + data);
 _respond(res, 'failure', data, httpCode);
}

//https://us-central1-bizrec-dev.cloudfunctions.net/getbanksFunction?uid=HJIOFS#53345DD
//no body {}
function handleGET (req, res)
{
  // Do something with the GET request
   var resMsg = '';
   console.log('Inside serer.post(getbanks)');
   console.log('req.query.uid = ' + JSON.stringify(req.query.uid));
   var routingUid = req.query.uid;

   if(routingUid === null || routingUid === undefined) {
    resMsg = "Error: req.query.routingUid required to create Index in ES ->" + routingUid;
    failure(res,resMsg,401);
   }

   resMsg = 'Data not found in index in ES';

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

  console.log('Checking if index Exists('+config.banks_index_name+')');
  esClient.indices.exists({index: config.banks_index_name})
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
                     [configUser.usr_uid] : userBody.uid
                   }
                 }
            }
       };
       console.log('queryBodyCheckUserExists (JSON) is->'+JSON.stringify(queryBodyCheckUserExists));
       //Note esClient.get() require index, type, and id of the documdnt. If id known then no issues. here we are
       //seaching based on uid parameter of the user object. not its ES id. hence .get() dosen't work
       //If used, it will create duplicate records.
       //esClient.get(queryBodyCheckUserExists)
       esClient.search(queryBodyCheckUserExists)
         .then(function (respUserCheck) {
           //check hits if there are any user records!
           console.log('hits.total =' + respUserCheck.hits.total);
           if(respUserCheck.hits.total === 0){
             //user doesn't exists
             console.log('User does not exists in user index. Creating now! - '+ JSON.stringify(respUserCheck));
             resMsg = 'Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error;
             failure(res,resMsg,500);
             }
             else if(respUserCheck.hits.total === 1 ){
               //only one record for the user. Update the user record for the user.uid
               console.log('User exists in user index. Updating now! - '+ JSON.stringify(respUserCheck));
               var hits = respUserCheck.hits.hits;
               console.log('hits object - '+ JSON.stringify(hits[0]));
               //User Uid exists
               // GET Bank Data fron Banks Index
               var indexAliasName = routingUid+config.banks_alias_token_read;
               console.log('Alias name derived through routing is ->'+indexAliasName);
               var queryBody = {
                 index: indexAliasName,
                 type: config.index_base_type,
                 [config.banks_routing_column_name] : routingUid,
                 body: {
                   query: {
                        match: {
                          //[configUser.usr_uid] : userBody.uid
                        },
                        sort:{ //may be ES sorts records by timestamp
                          'created': 'desc'
                        }
                      }
                 }
               };
               esClient.search(queryBody)
               .then(function (resp) {
                   resMsg = 'Banks Data Retrieved Successfully!' ;
                   console.log(resMsg);
                   //esClient.close(); //use in lambda only
                   successArray(res,resp.hits.hits);
                   },
                     function (error) {
                       resMsg = 'Error : banks document read ['+indexAliasName+'] Failed!' + JSON.stringify(error);
                       //esClient.close(); //use in lambda only
                       failure(res,resMsg,500);
                   });
               }
             else{
               //user has multiple records. Delete rest!
               console.log('Too many copies of the user present! Contact System Adminstrator!');
               console.log('*****');
               console.log(JSON.stringify(respUserCheck));
               console.log('*****');
               resMsg = 'Error : Too many user records found ['+config.user_index_write_alias_name+']! Duplicate records of the user exists. Conctact System Adminstrator.' + error;
               failure(res,resMsg,500);
             }
         }, function (error) {
                 resMsg = 'Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error;
                 failure(res,resMsg,500);
             });//End: check user exists
      }//end if
      else {
        //index dosen't exist. Create one.
         console.log('Index does not Exists! Can not get banks data. Error value is ->'+JSON.stringify(err));
         resMsg = 'Bank Index does not Exists!. Error Value = '+JSON.stringify(err);
         failure(res,resMsg,404);
      } // end else - index doesn't exist
   });//end then - indices.exists()

}

exports.handler = function(req, res, database)
{
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
