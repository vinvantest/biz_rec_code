'use strict';

var esClient = require('elasticsearch');
var config  = require('./config.js');

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

function handleGET (req, res) {
  // Do something with the GET request
  var resMsg = '';
  console.log('Inside serer.get(getUsers)');

  var indexAliasName = req.query.indexAliasName;
  if(indexAliasName === null || indexAliasName === undefined) {
    resMsg = "Error: req.params.indexAliasName required to create Index in ES ->" + indexAliasName;
    failure(res,resMsg,500);
  }
  console.log('req.params.indexAliasName = ' + JSON.stringify(req.query.indexAliasName));

  //get Query params
  console.log('queryParams passed is ->'
        + 'where first param usrIsBox is: ' + JSON.stringify(req.body.usrIsBox)
        + 'second param is usrIsGoogle is: ' + JSON.stringify(req.body.usrIsGoogle)
        + 'third param is: ' + JSON.stringify(req.query.third)
      );
  //you can loop in the query object
  for(var field in req.body){
  console.log('Field['+field+'] = '+req.body[field]);
  }//for loop end

  resMsg = 'Error - Document Not Indexed in ['+indexAliasName+']';
  console.log('Checking if ['+indexAliasName+'] Exists');

  var isBox = req.body.usrIsBox;
  var isGoogle = req.body.usrIsGoogle;
  console.log('docmentId to be found in index isBox ['+isBox+'] - and isGoogle ['+isGoogle+']');

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

  esClient.indices.exists({index: indexAliasName})
    .then(function (exists)
           {
             console.log('inside function indices.exists())');
             if(exists)
             { //index exists
               console.log('Index ['+indexAliasName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists));
               resMsg = 'Index ['+indexAliasName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists);
                //if you want to search ... but best use get() for quicker results
                var queryBody;

                if(isBox === 'true')
                {
                  console.log('inside isBOX and setting query param for user');
                  queryBody = {
                        query : {
                          match : {
                               usrIsBox : true,
                          }
                        }
                  };
                }
               if(isGoogle === 'true')
               {
                 console.log('inside isGoogle and setting query param for user');
                 queryBody = {
                       query : {
                         match : {
                              usrIsGoogle : true,
                         }
                       }
                 };
               }
               //now get the document id by uuid
               //var queryBody = { index : indexAliasName, type : 'base_type', id : userUUID };
               //now search for the record
               //esClient.get(queryBody)
               esClient.search({index: indexAliasName, type: 'type_name', body: queryBody})
                 .then(function (resp){
                   console.log('Index ['+indexAliasName+'] exists in ElasticSearch AND response is = '+JSON.stringify(resp));
                   //resMsg = 'Index ['+indexAliasName+'] exists in ElasticSearch AND count = '+resp.count;
                   //esClient.close();
                   successArray(res,resp.hits.hits);
                 },function (error) {
                   console.log('Error: Index ['+indexAliasName+'] exists in ElasticSearch but search() error -'+JSON.stringify(error));
                   resMsg = 'Error: Index ['+indexAliasName+'] exists in ElasticSearch but search() error -'+JSON.stringify(error);
                   //esClient.close();
                   failure(res,resMsg,500);
                 }); //end search()
             }//end if index Exists
             else {
               //index dosen't exist
               console.log('Index ['+indexAliasName+'] does not exist! Error value is ->'+exists);
               resMsg = 'Index ['+indexAliasName+'] does not exists!'+exists;
                //esClient.close();
                failure(res,resMsg,404);
             }//end else index exists
           }); //end then - indices.exists()

}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handlePOST (req, res) {
  // Do something with the PUT request
  console.log('Inside serer.get(getUsers)');

  var indexAliasName = req.query.indexAliasName;
  if(indexAliasName === null || indexAliasName === undefined) {
    var resMsgErr = "Error: req.params.indexAliasName required to create Index in ES ->" + indexAliasName;
    failure(res,resMsgErr,500);
  }
  console.log('req.params.indexAliasName = ' + JSON.stringify(req.query.indexAliasName));

  //get Query params
  console.log('queryParams passed is ->'
        + 'where first param usrIsBox is: ' + JSON.stringify(req.body.usrIsBox)
        + 'second param is usrIsGoogle is: ' + JSON.stringify(req.body.usrIsGoogle)
        + 'third param is: ' + JSON.stringify(req.query.third)
      );
  //you can loop in the query object
  for(var field in req.body){
  console.log('Field['+field+'] = '+req.body[field]);
  }//for loop end

  res.status(403).send('Forbidden!');
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
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
