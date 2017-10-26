'use strict';

var esClient = require('./config/elasticsearch/elasticConfig.js');
var config  = require('./config.js');
var configUser = require('./config/specific/user_template_columns.js');

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

//https://us-central1-bizrec-dev.cloudfunctions.net/createUser?isSubscribed=true&isNotified=false
// body {} -- user object body
function handlePOST (req, res)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(createUser)');
   console.log('req.query.isSubscribed = ' + JSON.stringify(req.query.isSubscribed));
   console.log('req.query.isNotified = ' + JSON.stringify(req.query.isNotified));
   console.log('req.body.user = '+JSON.stringify(req.body.user));
   var isSubscribed = req.query.isSubscribed;
   var isNotified = req.query.isNotified;
   var userBody = req.body.user;
   var isSubscribedBoolean = false;
   var isNotifiedBoolean = false;

   if(isSubscribed === null || isSubscribed === undefined) {
    resMsg = "Error: req.query.isSubscribed required to create Index in ES ->" + isSubscribed;
    failure(res,resMsg,401);
   }
   if(isNotified === null || isNotified === undefined) {
    resMsg = "Error: req.query.isNotified required to create Index in ES ->" + isNotified;
    failure(res,resMsg,401);
   }
   if(userBody === null || userBody === undefined) {
    resMsg = "Error: req.query.userBody required to create Index in ES ->" + JSON.stringify(userBody);
    failure(res,resMsg,401);
   }
   else{
     if(userBody.uid === null || userBody.uid === undefined)
     {
       resMsg = "Error: req.query.userBody.uid required to create Index in ES ->" + JSON.stringify(userBody);
       failure(res,resMsg,401);
     }
     else{
       console.log('usr_uid = '+userBody.uid);
       if(userBody.displayName === null || userBody.displayName === undefined) userBody.displayName = 'usr_displayName';
       if(userBody.emailVerified === null || userBody.emailVerified === undefined) userBody.emailVerified = false;
       if(userBody.phoneNumber === null || userBody.phoneNumber === undefined) userBody.phoneNumber = 'usr_phoneNumber';
       if(userBody.photoURL === null || userBody.photoURL === undefined) userBody.photoURL = 'usr_photoURL';
       if(userBody.email === null || userBody.email === undefined) userBody.email = 'usr_email';
     }
   }
   if(isSubscribed.includes('true')) isSubscribedBoolean = true;
   if(isNotified.includes('true')) isNotifiedBoolean = true;
   console.log('config.user_index_name ='+config.user_index_name);

   var queryBodyUserObject = {
     [configUser.usr_uid]: userBody.uid,
     [configUser.usr_displayName] : userBody.displayName,
     [configUser.usr_firstName] : 'usr_firstName',
     [configUser.usr_familyName] : 'usr_familyName',
     [configUser.usr_middleName] : 'usr_middleName',
     [configUser.usr_emailVerified]: userBody.emailVerified,
     [configUser.usr_phoneNumber]: userBody.phoneNumber,
     [configUser.usr_photoURL] : userBody.photoURL,
     //[configUser.usr_dob] : 'usr_dob', //don't give date object. will be wrong if absent in user.DOB
     [configUser.usr_gender] : 'usr_gender',
     [configUser.usr_email] : userBody.email,
     [configUser.usr_businessName] : 'company_businessName',
     [configUser.usr_ABN] : 'company_ABN_ACN_LC'	,
     [configUser.usr_contact] : 'company_contact',
     [configUser.usr_companyEmail] : 'company__email',
     [configUser.usr_companyAddStreet] : 'company_address_streetNumber',
     [configUser.usr_companyAddStName] : 'company_address_streetName',
     [configUser.usr_companyAddStType] : 'company_address_streetType',
     [configUser.usr_companyAddSuburb] : 'company_address_suburb',
     [configUser.usr_companyAddState] : 'company_address_state',
     [configUser.usr_companyAddPostCode] : 'company_address_postcode',
     [configUser.usr_companyAddCountry] : 'company_address_country',
     [configUser.usr_url] : 'usr_url',
     [configUser.usr_locale] : 'usr_locale',
     [configUser.usr_currency] : 'usr_currency',
     [configUser.usr_isSubscritionActive] : isSubscribedBoolean,
     [configUser.usr_isNotified] : isNotifiedBoolean,
     [configUser.usr_subscriptionType]: 'usr_subscriptionType',
     [configUser.usr_subscriptionAmount] : 0,
     [configUser.usr_subscriptionCostToDate] : 0,
     [configUser.usr_subscriptionFrequency]: 0,
     [configUser.usr_isUserCloudConnected] : false,
     [configUser.usr_isDropBox] : false,
     [configUser.usr_isGoogle]: false,
     [configUser.usr_isBox] : false,
     [configUser.usr_isICloud] : false,
     [configUser.usr_isOneDrive] : false,
     [configUser.usr_invoicePaymentBankBSB] : 0,
     [configUser.usr_invoicePaymentBankAccountNumber] : 0,
     [configUser.usr_invoicePaymentBankAccountName] : 'usr_invoicePaymentBankAccountName',
     [configUser.usr_invoicePaymentBankName] : 'usr_invoicePaymentBankName'
   };

   /*
     //firebase-auth Google provider --> "user" object
     {
       "uid":"GOOicZrZADQMOhUjqGtzh3UiGIj2",
       "displayName":"Vinayak Vanarse",
       "photoURL":"https://lh5.googleusercontent.com/-GVY334SIV28/AAAAAAAAAAI/AAAAAAAAAF8/76a2XsxEgGk/photo.jpg",
       "email":"vinayak.vanarse@gmail.com",
       "emailVerified":true,
       "phoneNumber":null,
       "isAnonymous":false,
       "providerData":[
               {"uid":"112773197373249639440",
                "displayName":"Vinayak Vanarse",
                "photoURL":"https://lh5.googleusercontent.com/-GVY334SIV28/AAAAAAAAAAI/AAAAAAAAAF8/76a2XsxEgGk/photo.jpg",
                "email":"vinayak.vanarse@gmail.com",
                "phoneNumber":null,
                "providerId":"google.com"
                }
               ],
       "apiKey":"AIzaSyBnA4Fen4iiDLABQoPUX3ePSDgeoCKjQq0",
       "appName":"[DEFAULT]",
       "authDomain":"vin-poly-fire.firebaseapp.com",
       "stsTokenManager":{
               "apiKey":"AIzaSyBnA4Fen4iiDLABQoPUX3ePSDgeoCKjQq0",
               "refreshToken":"APRrRCIwECYvcyq-3y8xnOt6wN7vYbM8OtR8s",
               "accessToken":"eyJhbGciOiJSUzI1NiIOTczNzMyNUzA",
               "expirationTime":1505285846321
               },
        "redirectEventId":null
     }
   */
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
              esClient.index({
                                index: config.user_index_write_alias_name,
                                type: config.index_base_type,
                                body: queryBodyUserObject
                  })
                    .then(function (respInsertUser) {
                      resMsg = 'New User Data Created Successfully!' ;
                      console.log(resMsg);
                      //esClient.close(); //use in lambda only
                      success(res,resMsg);
                      },
                      function (errorInsertUser) {
                      console.log('Error : New user document creation ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser);
                      resMsg = 'Error : User document update ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser;
                      success(res,resMsg);
                      });
              }
              else if(respUserCheck.hits.total === 1 ){
                //only one record for the user. Update the user record for the user.uid
                console.log('User exists in user index. Updating now! - '+ JSON.stringify(respUserCheck));
                var hits = respUserCheck.hits.hits;
                console.log('hits object - '+ JSON.stringify(hits[0]));
                //User Uid exists
                //Update the User object in ES with latest data
                esClient.update({
                                  index: config.user_index_write_alias_name,
                                  type: config.index_base_type,
                                  id: hits[0]._id,
                                  body: {
                                    doc: {
                                      [configUser.usr_uid]: userBody.uid,
                                      [configUser.usr_displayName] : userBody.displayName,
                                      [configUser.usr_firstName] : 'usr_firstName',
                                      [configUser.usr_familyName] : 'usr_familyName',
                                      [configUser.usr_middleName] : 'usr_middleName',
                                      [configUser.usr_emailVerified]: userBody.emailVerified,
                                      [configUser.usr_phoneNumber]: userBody.phoneNumber,
                                      [configUser.usr_photoURL] : userBody.photoURL,
                                      //[configUser.usr_dob] : 'usr_dob', //don't give date object. will be wrong if absent in user.DOB
                                      [configUser.usr_gender] : 'usr_gender',
                                      [configUser.usr_email] : userBody.email,
                                      [configUser.usr_businessName] : 'company_businessName',
                                      [configUser.usr_ABN] : 'company_ABN_ACN_LC'	,
                                      [configUser.usr_contact] : 'company_contact',
                                      [configUser.usr_companyEmail] : 'company__email',
                                      [configUser.usr_companyAddStreet] : 'company_address_streetNumber',
                                      [configUser.usr_companyAddStName] : 'company_address_streetName',
                                      [configUser.usr_companyAddStType] : 'company_address_streetType',
                                      [configUser.usr_companyAddSuburb] : 'company_address_suburb',
                                      [configUser.usr_companyAddState] : 'company_address_state',
                                      [configUser.usr_companyAddPostCode] : 'company_address_postcode',
                                      [configUser.usr_companyAddCountry] : 'company_address_country',
                                      [configUser.usr_url] : 'usr_url',
                                      [configUser.usr_locale] : 'usr_locale',
                                      [configUser.usr_currency] : 'usr_currency',
                                      [configUser.usr_isSubscritionActive] : isSubscribedBoolean,
                                      [configUser.usr_isNotified] : isNotifiedBoolean,
                                      [configUser.usr_subscriptionType]: 'usr_subscriptionType',
                                      [configUser.usr_subscriptionAmount] : 0,
                                      [configUser.usr_subscriptionCostToDate] : 0,
                                      [configUser.usr_subscriptionFrequency]: 0,
                                      [configUser.usr_isUserCloudConnected] : false,
                                      [configUser.usr_isDropBox] : false,
                                      [configUser.usr_isGoogle]: false,
                                      [configUser.usr_isBox] : false,
                                      [configUser.usr_isICloud] : false,
                                      [configUser.usr_isOneDrive] : false,
                                      [configUser.usr_invoicePaymentBankBSB] : 0,
                                      [configUser.usr_invoicePaymentBankAccountNumber] : 0,
                                      [configUser.usr_invoicePaymentBankAccountName] : 'usr_invoicePaymentBankAccountName',
                                      [configUser.usr_invoicePaymentBankName] : 'usr_invoicePaymentBankName'
                                    }
                                }
                    })
                      .then(function (respInsertUser) {
                        resMsg = 'User Data existed and now updated Successfully!' ;
                        console.log(resMsg);
                        //esClient.close(); //use in lambda only
                        success(res,resMsg);
                        },
                        function (errorInsertUser) {
                        console.log('Error : User document update ['+config.user_index_write_alias_name+'] Failed! But old record exists.' + errorInsertUser);
                        resMsg = 'Error : User document update ['+config.user_index_write_alias_name+'] Failed! But old record exists.' + errorInsertUser;
                        //esClient.close(); //use in lambda only
                        success(res,resMsg);
                        });
              }
              else{
                //user has multiple records. Delete rest!
                console.log('Too many copies of the user present! Contact System Adminstrator!');
                console.log('*****');
                console.log(JSON.stringify(respUserCheck));
                console.log('*****');
                resMsg = 'Error : New User document creation ['+config.user_index_write_alias_name+'] Failed! Duplicate records of the user exists. Contact System Adminstrator.' + error;
                failure(res,resMsg,500);
              }
          }, function (error) {
                  resMsg = 'Error : User not found in user Index. Creating new user record! Error - ' + error;
                  console.log(resMsg);
                  //Insert the User object in ES
                  //esClient.search(queryBodyUserObject)
                  esClient.index({
                                  index: config.user_index_write_alias_name,
                                  type: config.index_base_type,
                                  body: queryBodyUserObject
                    })
                      .then(function (resp) {
                          resMsg = 'New User Data created Successfully!' ;
                          console.log(resMsg);
                          //esClient.close(); //use in lambda only
                          success(res,resMsg);
                        },
                        function (error) {
                          resMsg = 'Error : New User document creation ['+config.user_index_write_alias_name+'] Failed!' + error;
                          //esClient.close(); //use in lambda only
                          failure(res,resMsg,500);
                      });
              });//End: check user exists
       }//end if
       else{
         //index dosen't exist. Create one.
    			console.log('Index does not Exists! Can not insert user to the index. Error value is ->' + error);
    			resMsg = 'Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
          failure(res,resMsg,500);
       }
     });//end then - indices.exists()

}//end POST

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
  case 'OPTIONS':
       handleOPTIONS(req, res)
       break;
  default:
    res.status(500).send({ error: 'Something blew up!' });
    break;
  }
};
