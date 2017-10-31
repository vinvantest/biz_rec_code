'use strict';

var config  = require('./config.js');
var configUser = require('./config/specific/user_template_columns.js');

function handlePOST (user, esClient)
{
  // Do something with the POST request
   var resMsg = '';
   console.log('Inside serer.post(createUserOnAuth)');
   var isSubscribed = user.isSubscribed;
   var isNotified = user.isNotified;
   var userBody = user;
   var isSubscribedBoolean = false;
   var isNotifiedBoolean = false;

   if(userBody === null || userBody === undefined) {
    resMsg = "Error: userBody required to document user in ES ->" + JSON.stringify(userBody);
    console.log(resMsg);
    return;
   }
   else{
     if(userBody.uid === null || userBody.uid === undefined)
     {
       resMsg = "Error: req.query.userBody.uid required to create Index in ES ->" + JSON.stringify(userBody);
       console.log(resMsg);
       return;
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
   if(isSubscribed != null || isSubscribed != undefined)
      if(isSubscribed.includes('true')) isSubscribedBoolean = true;
   if(isNotified != null || isNotified != undefined)
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

   resMsg = 'Data not found in index in ES';

   esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				return;
			} else {
				console.log('Elasticsearch Instance on ObjectRocket Connected!');
			}
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
        resMsg = 'Index ['+config.user_index_name+'] already exists in ElasticSearch. Checking if user record exists';

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
                      return;
                      },
                      function (errorInsertUser) {
                      resMsg = 'Error : User document update ['+config.user_index_write_alias_name+'] Failed!' + errorInsertUser;
                      console.log(resMsg);
                      return;
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
                        return;
                        },
                        function (errorInsertUser) {
                        resMsg = 'Error : User document update ['+config.user_index_write_alias_name+'] Failed! But old record exists.' + errorInsertUser;
                        console.log(resMsg);
                        return;
                        });
              }
              else{
                //user has multiple records. Delete rest!
                console.log('Too many copies of the user present! Contact System Adminstrator!');
                console.log('*****');
                console.log(JSON.stringify(respUserCheck));
                console.log('*****');
                resMsg = 'Error : New User document creation ['+config.user_index_write_alias_name+'] Failed! Duplicate records of the user exists. Contact System Adminstrator.' + error;
                console.log(resMsg);
                return;
              }
          }, function (error) {
                  resMsg = 'Error : searching user record! Error (attempt to create new record) - ' + error;
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
                          return;
                        },
                        function (error) {
                          resMsg = 'Error : New User document creation ['+config.user_index_write_alias_name+'] Failed!' + error;
                          console.log(resMsg);
                          return;
                      });
              });//End: check user exists
       }//end if
       else{
         //index dosen't exist. Create one.
    	   resMsg = 'Index does not Exists!. Can not insert user to the index. Error Value = '+ error;
         console.log(resMsg);
         return;
       }
     });//end then - indices.exists()

}//end POST

exports.handler = function(event, database, esClient)
{
  var usersRef = database.ref('users');
  const user = event.data; // The Firebase user.
  console.log( 'event data ='+JSON.stringify(event.data) );

  return handlePOST(user, esClient);

};

/* event.data =
{
	"displayName": "Ramhigh Low",
	"email": "testbizvv@gmail.com",
	"emailVerified": true,
	"metadata": {
		"creationTime": "2017-10-27T00:16:16Z",
		"lastSignInTime": "2017-10-27T00:16:16Z"
	},
	"photoURL": "https://lh5.googleusercontent.com/-7k6JG8RCtRI/AAAAAAAAAAI/AAAAAAAAAAc/aKrbE08MqDI/photo.jpg",
	"providerData": [{
		"displayName": "Ramhigh Low",
		"email": "testbizvv@gmail.com",
		"photoURL": "https://lh5.googleusercontent.com/-7k6JG8RCtRI/AAAAAAAAAAI/AAAAAAAAAAc/aKrbE08MqDI/photo.jpg",
		"providerId": "google.com",
		"uid": "106907019373764493113"
	}],
	"uid": "MePBMojfc4hXaM5x490hWAcxsIs2"
}
*/
