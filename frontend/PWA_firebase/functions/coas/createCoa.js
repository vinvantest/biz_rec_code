'use strict';

var config  = require('../config.js');
var configCoa = require('../config/specific/coa_template_columns.js');
var configUser = require('../config/specific/user_template_columns.js');
var helper = require('../config/helpers/helper.js');

function handleGET(req, res) {
  // Do something with the GET request
  res.status(403).send('Forbidden!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

function handleDELETE (req, res) {
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

//https://us-central1-bizrec-dev.cloudfunctions.net/createcoaFunction?uid=JSSJS2@222dDD
// body {} -- coa object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(createcoa)');
   console.log('req.body.user = '+JSON.stringify(req.query.uid));
   console.log('req.body.user = '+JSON.stringify(req.body.coa));
   var uid = req.query.uid;
   var coaBody = req.body.coa;
   if(uid === null || uid === undefined) {
    resMsg = "Error: req.query.uid required to create Index in ES ->" + uid;
    helper.failure(res,resMsg,401);
   }
   if(coaBody === null || coaBody === undefined) {
    resMsg = "Error: req.body.coaBody required to create Index in ES ->" + JSON.stringify(coaBody);
    helper.failure(res,resMsg,401);
   }
   var coaAliasIndexName = uid + config.coas_alias_token_read;
   var coaAliasIndexName_write = uid + config.coas_alias_token_write;
   console.log('coa Aliases: read [' + coaAliasIndexName + ' ] write [' + coaAliasIndexName_write + ']');

   var queryBodycoaObject = {
     [configCoa.coa_userId_routingAliasId] : coaBody.coa_userId_routingAliasId,
     [configCoa.coa_CoACategoryId] : coaBody.coa_CoACategoryId,
     [configCoa.coa_CoACategoryName] : coaBody.coa_CoACategoryName,
     [configCoa.coa_CoASubCategoryId] : coaBody.coa_CoASubCategoryId,
     [configCoa.coa_CoASubCategoryName] : coaBody.coa_CoASubCategoryName,
     [configCoa.coa_tax] : coaBody.coa_tax,
     [configCoa.coa_tax_type] : coaBody.coa_tax_type,
     [configCoa.coa_tax_percentage] : coaBody.coa_tax_percentage,
     [configCoa.coa_record_created] : coaBody.coa_record_created,
     [configCoa.coa_is_record_updated] : coaBody.coa_is_record_updated,
     [configCoa.coa_record_updated] : coaBody.coa_record_updated
   };
   console.log('coa Record to be updated/inserted = '+ JSON.stringify(queryBodycoaObject) );

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

	 console.log('Checking if user index Exists('+ config.user_index_name +')');
	 esClient.indices.exists({index: config.user_index_name})
		 .then(function (error,resp) {
       console.log('error value -' + error);
       console.log('response value - ' + resp);
       if(error)
       {
        console.log('Index ['+config.user_index_name+'] exists in ElasticSearch. Response is ->'+error);
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
            console.log('User hits.total =' + respUserCheck.hits.total);
            if(respUserCheck.hits.total === 0)
            {
              //user doesn't exists
              resMsg = 'User does not exists in user index. Cannot insert new coa record!';
              console.log(resMsg);
              helper.failure(res, resMsg, 404);
            }
            else if(respUserCheck.hits.total === 1 )
            {
                //only one record for the user
                console.log('User exists in user index. Creating new coa Data now! - '+ JSON.stringify(respUserCheck));
                console.log( 'hits object - '+ JSON.stringify(respUserCheck.hits.hits[0]) );
                var queryBodycoaExists = {
                     index : coaAliasIndexName,
                     type : config.index_base_type,
                     body: {
                       query: {
                           constant_score: {
                             filter: {
                               bool: {
                                 must: [
                                { term: { [configCoa.coa_CoACategoryId] : coaBody.coa_CoACategoryId } },
                                { term: { [configCoa.coa_CoACategoryName] : coaBody.coa_CoACategoryName } }
                                ]
                               }
                             }
                           }
                       }
                    }
                  };
                console.log('queryBodycoaExists (JSON) is->'+JSON.stringify(queryBodycoaExists));
                esClient.search(queryBodycoaExists)
                  .then(function (respcoaCheck) {
                    //check hits if there are any user records!
                    console.log('coas hits.total =' + respcoaCheck.hits.total);
                    if(respcoaCheck.hits.total === 0)
                    {
                      console.log('coa record does not exists. Creating a new one!');
                      //coa doesn't exists
                      esClient.index({
                                        index: coaAliasIndexName_write,
                                        type:  config.index_base_type,
                                        body:  queryBodycoaObject
                            })
                            .then(function (respInsertcoa) {
                              resMsg = 'User Data existed and coaing record inserted Successfully!' ;
                              console.log(resMsg);
                              helper.success(res,resMsg);
                              },
                              function (errorInsertcoa) {
                              resMsg = 'Error : New coaing document insertion ['+coaAliasIndexName_write+'] Failed!' + errorInsertcoa;
                              helper.failure(res,resMsg,500);
                              });
                      }
                      else if(respcoaCheck.hits.total === 1 )
                      {
                        console.log('coaing record with matching BSB and Account number exists! Updating data...');
                        //update coa record
                        esClient.update({
                                          index: coaAliasIndexName_write,
                                          type: config.index_base_type,
                                          id: respcoaCheck.hits.hits[0]._id,
                                          body: {
                                            doc: coaBody
                                         }
                            })
                              .then(function (respInsertUser) {
                                resMsg = 'coaing Data existed and now updated Successfully!' ;
                                console.log(resMsg);
                                //esClient.close(); //use in lambda only
                                helper.success(res,resMsg);
                                },
                                function (errorInsertUser) {
                                resMsg = 'Error : coaing document update ['+coaAliasIndexName+'] Failed! But old record exists.' + errorInsertUser;
                                console.log(resMsg);
                                helper.success(res,resMsg);
                                //TODO update this response to failure with correct error code
                                });
                      }
                      else {
                        //user has multiple records. Delete rest!
                        console.log('Error :: Too many copies of the coa record present!');
                        console.log('*****');
                        console.log(JSON.stringify(respcoaCheck));
                        console.log('*****');
                        resMsg = 'Error : New coa document creation ['+coaAliasIndexName+'] Failed! Duplicate coaing records for the user exists. Contact System Adminstrator.' + error;
                        helper.failure(res,resMsg,500);
                      }
                    }, function (error) {
                            resMsg = 'Error : coa record not found in coa Index. Inserting new. Error = ' + error;
                            console.log(resMsg);
                            esClient.index({
                                              index: coaAliasIndexName_write,
                                              type:  config.index_base_type,
                                              body:  queryBodycoaObject
                                  })
                                  .then(function (respInsertcoa) {
                                    resMsg = 'User Data existed and New coaing record inserted Successfully!' ;
                                    console.log(resMsg);
                                    helper.success(res,resMsg);
                                    },
                                    function (errorInsertcoa) {
                                    resMsg = 'Error : New coaing document insertion ['+ coaAliasIndexName_write +'] Failed!' + errorInsertcoa;
                                    helper.failure(res,resMsg,500);
                                    });
                });//End: check user exists
            }//end user If === 1
            else
            {
                //user has multiple records. Delete rest!
                console.log('Too many user copies of the user present! Contact System Adminstrator!');
                console.log('*****');
                console.log(JSON.stringify(respUserCheck));
                console.log('*****');
                resMsg = 'Error : coa document creation/updation ['+coaAliasIndexName_write+'] Failed! Duplicate user records of the user exists. Contact System Adminstrator.' + error;
                helper.failure(res,resMsg,500);
            }
          }, function (error) {
                  resMsg = 'Error : User not found in user Index. Error = ' + error;
                  console.log(resMsg);
                  helper.failure(res,resMsg,404);
              });//End: check user exists
       }//end if user index exists
       else{
         //index dosen't exist. Create one.
    			resMsg = 'User Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
          console.log(resMsg);
          helper.failure(res,resMsg,500);
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
      handlePOST(req, res, esClient);
      break;
  case 'DELETE':
       handleDELETE(req, res);
       break;
  case 'OPTIONS':
       handleOPTIONS(req, res)
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
