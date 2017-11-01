'use strict';

var config  = require('../config.js');
var configUser = require('../config/specific/user_template_columns.js');

function handleGET(req, res) {
  // Do something with the GET request
  res.status(403).send('Forbidden!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handlePOST (req, res) {
  // Do something with the DELETE request
  res.status(403).send('Forbidden!');
}

function handleOPTIONS(req, res) {
  console.log('inside handleOPTIONS()');
  res.set('Access-Control-Allow-Origin', 'https://bizrec-dev.firebaseapp.com')
	   .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT')
	   .status(200);
	   return;
}

function _respond(res, status, data, httpCode) {
     var response = {
       'status': status,
       'data' : data
     };
     //  res.setHeader('Content-type', 'application/json');  - this is restify
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', 'https://bizrec-dev.firebaseapp.com');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
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

//https://us-central1-bizrec-dev.cloudfunctions.net/deleteUserFunction?uid=HJKDHSK444DF34fF
// No body {}
function handleDELETE (req, res, esClient)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(deleteUser)');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));

   var uid = req.query.uid;
   if(uid === null || uid === undefined) {
    resMsg = "Error: req.query.userBody required to create Index in ES ->" + JSON.stringify(uid);
    failure(res,resMsg,401);
   }
   console.log('config.user_index_name ='+config.user_index_name);

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

	 console.log('Checking if index Exists('+ config.user_index_name +')');
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
               query: {
                    match: {
                      [configUser.usr_uid] : uid
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
              resMsg = 'User does not exists in user index';
              console.log( 'User does not exists in user index -'+ JSON.stringify(respUserCheck) );
              /*
              Sample resonse
              {
                      "status": "success",
                      "data": "User does not exists in user index -{\"took\":4,\"timed_out\":false,\"_shards\":{\"total\":50,\"successful\":50,\"failed\":0},\"hits\":{\"total\":0,\"max_score\":null,\"hits\":[]}}"
                  }
              */
              failure(res,resMsg, 404);
              }
              else if(respUserCheck.hits.total === 1 ){
                //only one record for the user. Update the user record for the user.uid
                console.log('User exists in user index. Deleting now! - '+ JSON.stringify(respUserCheck));
                var hits = respUserCheck.hits.hits;
                console.log('hits object - '+ JSON.stringify(hits[0]));
                //User Uid exists
                esClient.deleteByQuery({
                                  index: config.user_index_write_alias_name,
                                  type: config.index_base_type,
                                  body: {
                                    query: {
                                        term: { [configUser.usr_uid]: uid }
                                        }
                                      }
                    })
                      .then(function (respDeleteUser) {
                        resMsg = 'User Data existed and now deleted Successfully!' ;
                        console.log(resMsg);
                        success(res,resMsg);
                        },
                        function (errorInsertUser) {
                        resMsg = 'Error : User document deletion ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser;
                        console.log(resMsg);
                        failure(res,resMsg,500);
                        });
              }
              else{
                //user has multiple records. Delete rest!
                console.log('Too many copies of the user present! Contact System Adminstrator!');
                console.log('*****');
                console.log(JSON.stringify(respUserCheck));
                console.log('*****');
                esClient.deleteByQuery({
                                  index: config.user_index_write_alias_name,
                                  type: config.index_base_type,
                                  body: {
                                    query: {
                                        term: { [configUser.usr_uid]: uid }
                                        }
                                      }
                    })
                      .then(function (respDeleteUser) {
                        resMsg = 'User Data existed and now deleted Successfully!' ;
                        console.log(resMsg);
                        success(res,resMsg);
                        },
                        function (errorInsertUser) {
                        resMsg = 'Error : User document deletion ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser;
                        console.log(resMsg);
                        failure(res,resMsg,500);
                        });
              }
          }, function (error) {
                  resMsg = 'Error : User not found in user Index - ' + error;
                  console.log(resMsg);
                  failure(res, resMsg, 404);
              });//End: check user exists
       }//end if
       else{
         //index dosen't exist. Create one.
    			resMsg = 'Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
          console.log(resMsg);
          failure(res,resMsg,500);
       }
     });//end then - indices.exists()

}//end POST

exports.handler = function(req, res, database, esClient)
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
       handleDELETE(req, res, esClient);
       break;
  case 'OPTIONS':
       handleOPTIONS(req, res)
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
