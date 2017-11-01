var config = {
	consumer_key : 'YOU_CONSUMER_KEY',
	consumer_secret : 'YOUR_CONSUMER_SECRET',
	access_token : 'YOUR_ACCESS_TOKEN',
	access_token_secret : 'YOUR_ACCESS_TOKEN_SECRET',

	email_app_name: 'BizRec',
	email_service: 'gmail',
	email_host: 'smtp.gmail.com',
	email_auth_user: 'ramhanse@gmail.com',
	email_auth_pass: 'ramhanse1',
	email_from: 'BizRec <customerservice@bizrec.com>',
	email_cc: 'ramhanse@gmail.com',
	email_customer_service: 'customerservice@bizrec.com',

	email_welcome_template_id: '209b701b-0921-4ef4-aa94-3d5d9d93d617',
	email_bye_template_id : '8457a373-65ae-4bcd-827f-76c2497605a6',

	index_base_type: 'base_type',

	user_index_search_alias_name : 'global_alisas_for_search_users_index',
	user_index_write_alias_name : 'global_alisas_for_write_users_index',

	user_index_name: 'users_index_v1',

	banks_index_name: 'banks_index_v1',
	banks_alias_token_read: '_banks_read',
	banks_alias_token_write: '_banks_write',
	banks_routing_column_name: 'bank_userId_routingAliasId',
	banks_record_created_column_name: 'bank_record_created',
	banks_is_record_updated_column_name: 'bank_is_record_updated',
	banks_record_updated_column_name: 'bank_record_updated',

	coas_index_name: 'coas_index_v1',
	coas_alias_token_read: '_coa_read',
	coas_alias_token_write: '_coa_write',
	coas_routing_column_name: 'coa_userId_routingAliasId',
	coas_record_created_column_name: 'coa_record_created',
	coas_is_record_updated_column_name: 'coa_is_record_updated',
	coas_record_updated_column_name: 'coa_record_updated',

	customers_index_name: 'customers_index_v1',
	customers_alias_token_read: '_customers_read',
	customers_alias_token_write: '_customers_write',
	customers_routing_column_name: 'cust_userId_routingAliasId',
	customers_record_created_column_name: 'cust_record_created',
	customers_is_record_updated_column_name: 'cust_is_record_updated',
	customers_record_updated_column_name: 'cust_record_updated',

	invoices_index_name: 'invoices_index_v1',
	invoices_alias_token_read: '_invoices_read',
	invoices_alias_token_write: '_invoices_write',
	invoices_routing_column_name: 'inv_userId_routingAliasId',
	invoices_record_created_column_name: 'inv_record_created',
	invoices_is_record_updated_column_name: 'inv_is_record_updated',
	invoices_record_updated_column_name: 'inv_record_updated',

	notes_index_name: 'notes_index_v1',
	notes_alias_token_read: '_notes_read',
	notes_alias_token_write: '_notes_write',
	notes_routing_column_name: 'note_userId_routingAliasId',
	notes_record_created_column_name: 'note_record_created',
	notes_is_record_updated_column_name: 'note_is_record_updated',
	notes_record_updated_column_name: 'note_record_updated',

	payments_index_name: 'payments_index_v1',
	payments_alias_token_read: '_payments_read',
	payments_alias_token_write: '_payments_write',
	payments_routing_column_name: 'pymt_userId_routingAliasId',
	payments_record_created_column_name: 'pymt_record_created',
	payments_is_record_updated_column_name: 'pymt_is_record_updated',
	payments_record_updated_column_name: 'pymt_record_updated',

	rules_index_name: 'rules_index_v1',
	rules_alias_token_read: '_rules_read',
	rules_alias_token_write: '_rules_write',
	rules_routing_column_name: 'rule_userId_routingAliasId',
	rules_record_created_column_name: 'rule_record_created',
	rules_is_record_updated_column_name: 'rule_is_record_updated',
	rules_record_updated_column_name: 'rule_record_updated',

	suppliers_index_name: 'suppliers_index_v1',
	suppliers_alias_token_read: '_suppliers_read',
	suppliers_alias_token_write: '_suppliers_write',
	suppliers_routing_column_name: 'supp_userId_routingAliasId',
	suppliers_record_created_column_name: 'supp_record_created',
	suppliers_is_record_updated_column_name: 'supp_is_record_updated',
	suppliers_record_updated_column_name: 'supp_record_updated',

	transactions_index_name: 'transactions_index_v1',
	transactions_alias_token_read: '_transactions_read',
	transactions_alias_token_write: '_transactions_write',
	transactions_routing_column_name: 'tran_userId_routingAliasId',
	transactions_record_created_column_name: 'tran_record_created',
	transactions_is_record_updated_column_name: 'tran_is_record_updated',
	transactions_record_updated_column_name: 'tran_record_updated',

	settings_index_name: 'settings_index_v1',
	settings_alias_token_read: '_settings_read',
	settings_alias_token_write: '_settings_write',
	settings_routing_column_name: 'sett_userId_routingAliasId',
	settings_record_created_column_name: 'sett_record_created',
	settings_is_record_updated_column_name: 'sett_is_record_updated',
	settings_record_updated_column_name: 'sett_record_updated',

};

module.exports = config;

/*

ES commands

1. SEND Notifications: POST
https://fcm.googleapis.com/fcm/send
Headers:
Content-Type: application/json
Authorization: key=AAAAe7lo2cs:APA91bF9HmWWZ0p96s4loxqJARfW_Em_kRCSYIgtrbLwmz787tQU9izCdkfaxSuXaO28uZ-Q56E7fJukbMampUr7GNcfS1ga9tY27pNlrySEFeFMxGU8Y3J0KtOtlEhMrAcX1pUDIeTA

Body: raw

{
  "registration_ids" : [
      "djv6tEc6LQc:APA91bE8Vt3-0OEpgEg3xORN80lKZXJtgx454yiPEhh7DnGdqzeTF8y-HzBmAWp1fdEKfIJCnr_OP65iCRD9wrmwJDSZgPpf2W0ierZbuN9pOdBpiRMiqf4u50InR1BkB8IXcg_O4Ung",
      "ewJ3aXYMpgc:APA91bHoOmBr0MhcyUdRL4ItXKmITdrQg7FD9PKUiixvwFBYj9Z6n8WYEQzL8cnnJGmKl-uiw4KiP1P4XKei2CwGuIcUOxgjCR79-s9kNvvzjn7K8rfM4TUiQePoPA5kjAM_-q2hjjZm",
      "f2obdCiEnLA:APA91bGizFiNxGZ1F5_OWGEx7ZazFqOjpbXbB715hyL1EG-2B-8X-OjAyaYhkZ5vHiwCoBboKpyJTrDwQusCwV8VKmrxymXi-1CX_E0BJBe9-GR2LWVnS2PfF4XOeMAbebpu1pqWFtyW",
      "ewJ3aXYMpgc:APA91bHoOmBr0MhcyUdRL4ItXKmITdrQg7FD9PKUiixvwFBYj9Z6n8WYEQzL8cnnJGmKl-uiw4KiP1P4XKei2CwGuIcUOxgjCR79-s9kNvvzjn7K8rfM4TUiQePoPA5kjAM_-q2hjjZm"

      ],

    "notification" :
        {
          "title" : "Hello World",
          "body"  : "This is notification!"
        }
}

----------

2. Create Index: POST

https://us-central1-bizrec-dev.cloudfunctions.net/createIndexFunction?indexName=transactions_index_v1&templateType=transactions
Header:
Content-Type: application/json
No Body

------------

3. Create template : POST
https://us-central1-bizrec-dev.cloudfunctions.net/addTemplateToESFunction?templateName=users_template_v1&templateType=users

Delete template
https://us-central1-bizrec-dev.cloudfunctions.net/deleteTemplateFunction?templateName=users_index_v1

-------------

4. Delete Index: Delete

https://us-central1-bizrec-dev.cloudfunctions.net/deleteIndexFunction?indexName=users_index_v1

------------

5. Send TEST email : GET

https://us-central1-bizrec-dev.cloudfunctions.net/testSendMailFunction?email=vinvan_pict@yahoo.com&displayName=testvin

-------------------

6. TEST Alias Creation: POST

https://us-central1-bizrec-dev.cloudfunctions.net/testAliasCreationFunction
Header:
Content-Type: application/json
Body:
{
	"user": {
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
			"uid": "xxxDxxxPBMojfc4hXaM5x490hWAcxsIs2"
		}
}
---------------

7. List ES Templates
GET:
https://iad1-10914-0.es.objectrocket.com:20914/_template/u*
GET /_template/u* HTTP/1.1
Host: iad1-10914-0.es.objectrocket.com:20914
Content-Type: application/json
Authorization: Basic dmludGVzdDp0ZXN0MTIzNA==
Cache-Control: no-cache
Postman-Token: ef737c47-2d95-ba07-f302-b6579f4f1f7a

Authorization: ES vintest uid and pwd

-----------

8. Create Bank
POST
https://us-central1-bizrec-dev.cloudfunctions.net/createBankFunction?uid=GOOicZrZADQMOhUjqGtzh3UiGIj2
Content-Type: application/json
Body:

{
  "bank": {
     "bank_userIdRoutingAliasId" : "GOOicZrZADQMOhUjqGtzh3UiGIj2",
     "bank_providerName" : "bankBody.bank_providerName",
     "bank_providerAccountId" : "bankBody.bank_providerAccountId",
     "bank_providerIdentifier": "bankBody.bank_providerIdentifier",
     "bank_isBankAccountActive": "bankBody.bank_isBankAccountActive",
     "bank_isBankAccountVerified" : "bankBody.bank_isBankAccountVerified",
     "bank_additonalBankNotes" : "bankBody.bank_additonalBankNotes",
     "bank_refreshInfo" : "bankBody.bank_refreshInfo",
     "bank_refreshInfoStatusCode" : "bankBody.bank_refreshInfoStatusCode",
     "bank_refreshInfoStatusMessage" : "bankBody.bank_refreshInfoStatusMessage",
     "bank_refreshInfo_status" : "bankBody.bank_refreshInfo_status",
     "bank_isManual" : true,
     "bank_createdDate" : "2017-11-01T00:43:47.072Z",
     "bank_lastUpdated" : false,
     "bank_isAutoRefreshEnabled" : false,
     "bank_numberOfTransactionDays" : "bankBody.bank_numberOfTransactionDays",
     "bank_bankAccountName" : "bankBody.bank_bankAccountName",
     "bank_bankAccountNumber" : 3456789,
     "bank_BSB" : 123456,
     "bank_Branch" : "bankBody.bank_Branch",
     "bank_BranchNumber" : 12345678910,
     "bank_amountDue" : 4.4,
     "bank_availableBalance" : 3.3,
     "bank_availableCash" : 2.2,
     "bank_availableCredit": 1.1,
     "bank_nickname" : "bankBody.bank_nickname",
     "bank_status" : "bankBody.bank_status",
     "bank_recordCreated" : "2017-11-01T00:43:47.072Z",
     "bank_isRecordUpdated" : false,
     "bank_recordUpdated" : "2017-11-01T00:43:47.072Z"
   }
}

-----------------

9. CREATE User
POST
https://us-central1-bizrec-dev.cloudfunctions.net/createUserFunction?isSubscribed=true&isNotified=false
Content-Type: application/json
Body:

{
 "user" : {
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
}

*/
