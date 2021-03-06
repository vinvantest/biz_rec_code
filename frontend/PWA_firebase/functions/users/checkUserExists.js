'use strict';

var config  = require('../config.js');
var configUser = require('../config/specific/user_template_columns.js');
var helper = require('../config/helpers/helper.js');

function handleGET (req, res) {
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

// https://us-central1-bizrec-dev.cloudfunctions.net/createUserFunction
// body {user} -- user object body
function handlePOST (req, res, esClient)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(checkUserExists())');
   var userBody = req.body.user;
   var isSubscribedBoolean = false;
   var isNotifiedBoolean = false;

   if(userBody === null || userBody === undefined) {
    resMsg = "Error: req.query.userBody required to create Index in ES. It's null or undefined ->"+userBody;
    helper.failure(res,resMsg,401);
   }
   else {
     console.log('user object passed from client ->'+ JSON.stringify(userBody));
   }

   console.log('config.user_index_name ='+config.user_index_name);

   var usr_uid_clm = configUser.usr_uid; console.log('usr_uid_clm = '+usr_uid_clm);
   var usr_displayName_clm = configUser.usr_displayName ; console.log('usr_displayName_clm = '+usr_displayName_clm);
   var usr_firstName_clm = configUser.usr_firstName ;
   var usr_familyName_clm = configUser.usr_familyName ;
   var usr_middleName_clm = configUser.usr_middleName;
   var usr_emailVerified_clm = configUser.usr_emailVerified ;
   var usr_phoneNumber_clm = configUser.usr_phoneNumber;
   var usr_photoURL_clm = configUser.usr_photoURL ;
   var usr_dob_clm = configUser.usr_dob ;
   var usr_gender_clm = configUser.usr_gender ;
   var usr_email_clm = configUser.usr_email ;
   var usr_businessName_clm = configUser.company_businessName ;
   var usr_ABN_clm = configUser.company_ABN_ACN_LC ;
   var usr_contact_clm = configUser.company_contact ;
   var usr_companyEmail_clm = configUser.company__email ;
   var usr_companyAddStreet_clm = configUser.company_address_streetNumber ;
   var usr_companyAddStName_clm = configUser.company_address_streetName ;
   var usr_companyAddStType_clm = configUser.company_address_streetType ;
   var usr_companyAddSuburb_clm = configUser.company_address_suburb ;
   var usr_companyAddState_clm = configUser.company_address_state ;
   var usr_companyAddPostCode_clm = configUser.company_address_postcode ;
   var usr_companyAddCountry_clm = configUser.company_address_country ;
   var usr_url_clm = configUser.usr_url ; console.log('usr_url_clm = '+usr_url_clm);
   var usr_locale_clm = configUser.usr_locale ;
   var usr_currency_clm = configUser.usr_currency ;
   var usr_isSubscritionActive_clm = configUser.usr_isSubscritionActive ;
   var usr_isNotified_clm = configUser.usr_isNotified ;
   var usr_subscriptionType_clm = configUser.usr_subscriptionType;
   var usr_subscriptionAmount_clm = configUser.usr_subscriptionAmount ;
   var usr_subscriptionCostToDate_clm = configUser.usr_subscriptionCostToDate;
   var usr_subscriptionFrequency_clm = configUser.usr_subscriptionFrequency;
   var usr_isUserCloudConnected_clm = configUser.usr_isUserCloudConnected ;
   var usr_isDropBox_clm = configUser.usr_isDropBox ;
   var usr_isGoogle_clm = configUser.usr_isGoogle;
   var usr_isBox_clm = configUser.usr_isBox ; console.log('usr_isBox_clm = '+usr_isBox_clm);
   var usr_isICloud_clm = configUser.usr_isICloud ;
   var usr_isOneDrive_clm = configUser.usr_isOneDrive ;
   var usr_invoicePaymentBankBSB_clm = configUser.usr_invoicePaymentBankBSB ;
   var usr_invoicePaymentBankAccountNumber_clm = configUser.usr_invoicePaymentBankAccountNumber;
   var usr_invoicePaymentBankAccountName_clm = configUser.usr_invoicePaymentBankAccountName ;
   var usr_invoicePaymentBankName_clm = configUser.usr_invoicePaymentBankName ;

   var queryBodyUserObject = {
     usr_uid_clm: userBody.uid,
     usr_displayName_clm : userBody.displayName,
     usr_firstName_clm : 'usr_firstName',
     usr_familyName_clm : 'usr_familyName',
     usr_middleName_clm : 'usr_middleName',
     usr_emailVerified_clm : userBody.emailVerified,
     usr_phoneNumber_clm: userBody.phoneNumber,
     usr_photoURL_clm : userBody.photoURL,
     usr_dob_clm : 'usr_dob',
     usr_gender_clm : 'usr_gender',
     usr_email_clm : userBody.email,
     usr_businessName_clm : 'company_businessName',
     usr_ABN_clm : 'company_ABN_ACN_LC'	,
     usr_contact_clm : 'company_contact',
     usr_companyEmail_clm : 'company__email',
     usr_companyAddStreet_clm : 'company_address_streetNumber',
     usr_companyAddStName_clm : 'company_address_streetName',
     usr_companyAddStType_clm : 'company_address_streetType',
     usr_companyAddSuburb_clm : 'company_address_suburb',
     usr_companyAddState_clm : 'company_address_state',
     usr_companyAddPostCode_clm : 'company_address_postcode',
     usr_companyAddCountry_clm : 'company_address_country',
     usr_url_clm : 'usr_url',
     usr_locale_clm : 'usr_locale',
     usr_currency_clm : 'usr_currency',
     usr_isSubscritionActive_clm : isSubscribedBoolean,
     usr_isNotified_clm : isNotifiedBoolean,
     usr_subscriptionType_clm: 'usr_subscriptionType',
     usr_subscriptionAmount_clm : 'usr_subscriptionAmount',
     usr_subscriptionCostToDate_clm : 'usr_subscriptionCostToDate',
     usr_subscriptionFrequency_clm: 'usr_subscriptionFrequency',
     usr_isUserCloudConnected_clm : 'usr_isUserCloudConnected',
     usr_isDropBox_clm : 'usr_isDropBox',
     usr_isGoogle_clm: 'usr_isGoogle',
     usr_isBox_clm : 'usr_isBox',
     usr_isICloud_clm : 'usr_isICloud',
     usr_isOneDrive_clm : 'usr_isOneDrive',
     usr_invoicePaymentBankBSB_clm : 'usr_invoicePaymentBankBSB',
     usr_invoicePaymentBankAccountNumber_clm : 'usr_invoicePaymentBankAccountNumber',
     usr_invoicePaymentBankAccountName_clm : 'usr_invoicePaymentBankAccountName',
     usr_invoicePaymentBankName_clm : 'usr_invoicePaymentBankName'
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
	 esClient.indices.exists({ index: config.user_index_name})
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
                         usr_uid : userBody.uid
                       };
                esClient.get(queryBodyCheckUserExists)
                  .then(function (respUserCheck) {
                        console.log('User exists in user index - '+ respUserCheck);
                        //User Uid exists
                        //Update the User object in ES with latest data
                        //esClient.search(queryBodyCheckUserExists)
                        esClient.index({index: config.user_index_write_alias_name, type: config.index_base_type, body: queryBodyUserObject})
                        .then(function (respInsertUser) {
                            resMsg = 'User Data existed and now updated Successfully!' ;
                            console.log(resMsg);
                            //esClient.close(); //use in lambda only
                            helper.success(res,resMsg);
                            },
                              function (errorInsertUser) {
                                console.log('Error : User document update ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser);
                                resMsg = 'Error : User document update ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser;
                                //esClient.close(); //use in lambda only
                                helper.success(res,resMsg);
                            });
                    }, function (error) {
                            resMsg = 'Error : User not found in user Index -' + error;
                            console.log(resMsg);
                            helper.failure(res, resMsg, 404);
                      });//End: check user exists
       }//end if
       else{
         //index dosen't exist. Create one.
    			console.log('Index does not Exists! Can not insert user to the index. Error value is ->' + error);
    			resMsg = 'Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
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
