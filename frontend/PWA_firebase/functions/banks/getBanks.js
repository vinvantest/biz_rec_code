'use strict';

var config  = require('../config.js');
var configUser  = require('../config/specific/user_template_columns.js');
var configBank = require('../config/specific/bank_template_columns.js');
var helper = require('../config/helpers/helper.js');
var msgConfig = require('../config/global/messages.js');

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

//https://us-central1-bizrec-dev.cloudfunctions.net/getbanksFunction?uid=HJIOFS#53345DD&page=0&size=10
//no body {}
function handleGET (req, res, esClient)
{
  // Do something with the GET request

   console.log('Inside serer.get(getbanks)');
   console.log('req.query.uid = ' + req.query.uid);
   console.log('req.query.page = ' + req.query.page);
   console.log('req.query.size = ' + req.query.size);
   var routingUid = req.query.uid;
   var page = req.query.page;
   var sizeVal = req.query.size;
   var fromVal = 0;

   if(routingUid === null || routingUid === undefined) {
    console.log("Error: req.query.routingUid required to retrieve Index in ES ->" + routingUid);
    helper.failure(res,msgConfig.banks_invalid_uid + msgConfig.support_contact,401);
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
				failure(res, msgConfig.elastic_cluster_down + error, 500);
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
             console.log('User does not exists in user index. Creating now! - '+ JSON.stringify(respUserCheck));
             helper.failure(res,msgConfig.banks_user_not_exists + msgConfig.support_contact,500);
             }
             else if(respUserCheck.hits.total === 1 ){
               //only one record for the user. Update the user record for the user.uid
               console.log('User exists in user index. Updating now! - '+ JSON.stringify(respUserCheck));
               var hits = respUserCheck.hits.hits;
               console.log('hits object - '+ JSON.stringify(hits[0]));
               //User Uid exists
               // GET Bank Data fron Banks Index
               var indexAliasName = routingUid+config.banks_alias_token_read;
               //indexAliasName = 'banks_index_v1';
               console.log('Alias name derived through routing is ->'+indexAliasName);
               var queryBody = {
                 index: indexAliasName,
                 type: config.index_base_type,
                 body: {
                   from: fromVal,
                   size: Number(sizeVal),
                   sort: [
                        { [config.banks_record_updated_column_name]: { order: 'desc' } }
                      ]
                  }
               };
               console.log('getBank search DSL -> ' + JSON.stringify(queryBody));
               esClient.search(queryBody)
               .then(function (resp) {
                   console.log('Banks Data Retrieved Successfully!');
                   helper.success(res,resp.hits);
                   },
                     function (error) {
                       console.log('Error : banks document read ['+indexAliasName+'] Failed!' + JSON.stringify(error));
                       helper.failure(res,msgConfig.banks_record_retrieve_failed,500);
                   });
               }
             else{
               //user has multiple records. Delete rest!
               console.log(JSON.stringify(respUserCheck));
               console.log('Error : Too many user records found ['+config.user_index_write_alias_name+']! Duplicate records of the user exists. Conctact System Adminstrator.' + error);
               helper.failure(res,msgConfig.banks_duplicate_user_found + msgConfig.support_contact,500);
             }
         }, function (error) {
                 console.log('Error : User does not exists in database ['+config.user_index_write_alias_name+']. Contact System Adminstrator.' + error);
                 helper.failure(res,msgConfig.banks_user_not_exists + msgConfig.support_contact,500);
             });//End: check user exists
      }//end if
      else {
        //index dosen't exist. Create one.
         console.log('Bank Index does not Exists! Can not get banks data. Error value is ->'+JSON.stringify(err));
         helper.failure(res,msgConfig.banks_user_index_not_exists + msgConfig.support_contact,404);
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

/*
Convert ISO Date String to Date object
function converToLocalTime(serverDate) {

    var dt = new Date(Date.parse(serverDate));
    var localDate = dt;

    var gmt = localDate;
        var min = gmt.getTime() / 1000 / 60; // convert gmt date to minutes
        var localNow = new Date().getTimezoneOffset(); // get the timezone
        // offset in minutes
        var localTime = min - localNow; // get the local time

    var dateStr = new Date(localTime * 1000 * 60);
    // dateStr = dateStr.toISOString("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    // this will return as just the server date format i.e., yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
    dateStr = dateStr.toString("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    return dateStr;
}

Convert Date to ISO Date string
var dt = new Date("30 July 2010 15:05 UTC");
document.write(dt.toISOString());

--- Sample Data
{
	"status": "success",
	"successFlag": true,
	"data": [
    {
		"_index": "banks_index_v1",
		"_type": "base_type",
		"_id": "AV965LeFiZHTo3raAYJn",
		"_score": null,
		"_routing": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
		"_source": {
			"bank_userId_routingAliasId": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
			"bank_providerName": "bankBody.bank_providerName",
			"bank_providerAccountId": "bankBody.bank_providerAccountId",
			"bank_providerIdentifier": "bankBody.bank_providerIdentifier",
			"bank_isBankAccountActive": "bankBody.bank_isBankAccountActive",
			"bank_isBankAccountVerified": "bankBody.bank_isBankAccountVerified",
			"bank_additonalBankNotes": "bankBody.bank_additonalBankNotes",
			"bank_refreshInfo": "bankBody.bank_refreshInfo",
			"bank_refreshInfo_statusCode": "bankBody.bank_refreshInfoStatusCode",
			"bank_refreshInfo_statusMessage": "bankBody.bank_refreshInfoStatusMessage",
			"bank_refreshInfo_status": "bankBody.bank_refreshInfo_status",
			"bank_isManual": true,
			"bank_createdDate": "2017-11-01T00:43:47.072Z",
			"bank_lastUpdated": false,
			"bank_isAutoRefreshEnabled": false,
			"bank_numberOfTransactionDays": "bankBody.bank_numberOfTransactionDays",
			"bank_bankAccountName": "bankBody.bank_bankAccountName",
			"bank_bankAccountNumber": 3456789,
			"bank_BSB": 444444444,
			"bank_Branch": "bankBody.bank_Branch",
			"bank_BranchNumber": 12345678910,
			"bank_amountDue": 4.4,
			"bank_availableBalance": 3.3,
			"bank_availableCash": 2.2,
			"bank_availableCredit": 1.1,
			"bank_nickname": "bankBody.bank_nickname",
			"bank_status": "bankBody.bank_status",
			"bank_record_created": "2017-11-01T00:43:47.072Z",
			"bank_is_record_updated": true,
			"bank_record_updated": "2017-12-01T00:43:47.072Z"
		},
		"sort": [1512089027072]
	}, {
		"_index": "banks_index_v1",
		"_type": "base_type",
		"_id": "AV96yKgD_z-xNZFzHxhC",
		"_score": null,
		"_routing": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
		"_source": {
			"bank_userId_routingAliasId": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
			"bank_providerName": "bankBody.bank_providerName",
			"bank_providerAccountId": "bankBody.bank_providerAccountId",
			"bank_providerIdentifier": "bankBody.bank_providerIdentifier",
			"bank_isBankAccountActive": "bankBody.bank_isBankAccountActive",
			"bank_isBankAccountVerified": "bankBody.bank_isBankAccountVerified",
			"bank_additonalBankNotes": "bankBody.bank_additonalBankNotes",
			"bank_refreshInfo": "bankBody.bank_refreshInfo",
			"bank_refreshInfo_statusCode": "bankBody.bank_refreshInfoStatusCode",
			"bank_refreshInfo_statusMessage": "bankBody.bank_refreshInfoStatusMessage",
			"bank_refreshInfo_status": "bankBody.bank_refreshInfo_status",
			"bank_isManual": true,
			"bank_createdDate": "2017-11-01T00:43:47.072Z",
			"bank_lastUpdated": false,
			"bank_isAutoRefreshEnabled": false,
			"bank_numberOfTransactionDays": "bankBody.bank_numberOfTransactionDays",
			"bank_bankAccountName": "bankBody.bank_bankAccountName",
			"bank_bankAccountNumber": 3456789,
			"bank_BSB": 222222,
			"bank_Branch": "bankBody.bank_Branch",
			"bank_BranchNumber": 12345678910,
			"bank_amountDue": 4.4,
			"bank_availableBalance": 3.3,
			"bank_availableCash": 2.2,
			"bank_availableCredit": 1.1,
			"bank_nickname": "bankBody.bank_nickname",
			"bank_status": "bankBody.bank_status",
			"bank_record_created": "2017-11-01T00:43:47.072Z",
			"bank_is_record_updated": false,
			"bank_record_updated": "2017-11-01T00:43:47.072Z",
			"bank_recordCreated": "2017-11-01T00:43:47.072Z",
			"bank_refreshInfoStatusCode": "bankBody.bank_refreshInfoStatusCode",
			"bank_isRecordUpdated": true,
			"bank_recordUpdated": "2017-10-01T00:43:47.072Z",
			"bank_refreshInfoStatusMessage": "bankBody.bank_refreshInfoStatusMessage",
			"bank_userIdRoutingAliasId": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3"
		},
		"sort": [1509497027072]
	}, {
		"_index": "banks_index_v1",
		"_type": "base_type",
		"_id": "AV96419r_z-xNZFzHxhD",
		"_score": null,
		"_routing": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
		"_source": {
			"bank_userId_routingAliasId": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
			"bank_providerName": "bankBody.bank_providerName",
			"bank_providerAccountId": "bankBody.bank_providerAccountId",
			"bank_providerIdentifier": "bankBody.bank_providerIdentifier",
			"bank_isBankAccountActive": "bankBody.bank_isBankAccountActive",
			"bank_isBankAccountVerified": "bankBody.bank_isBankAccountVerified",
			"bank_additonalBankNotes": "bankBody.bank_additonalBankNotes",
			"bank_refreshInfo": "bankBody.bank_refreshInfo",
			"bank_refreshInfo_statusCode": "bankBody.bank_refreshInfoStatusCode",
			"bank_refreshInfo_statusMessage": "bankBody.bank_refreshInfoStatusMessage",
			"bank_refreshInfo_status": "bankBody.bank_refreshInfo_status",
			"bank_isManual": true,
			"bank_createdDate": "2017-11-01T00:43:47.072Z",
			"bank_lastUpdated": false,
			"bank_isAutoRefreshEnabled": false,
			"bank_numberOfTransactionDays": "bankBody.bank_numberOfTransactionDays",
			"bank_bankAccountName": "bankBody.bank_bankAccountName",
			"bank_bankAccountNumber": 3456789,
			"bank_BSB": 1111111,
			"bank_Branch": "bankBody.bank_Branch",
			"bank_BranchNumber": 12345678910,
			"bank_amountDue": 4.4,
			"bank_availableBalance": 3.3,
			"bank_availableCash": 2.2,
			"bank_availableCredit": 1.1,
			"bank_nickname": "bankBody.bank_nickname",
			"bank_status": "bankBody.bank_status",
			"bank_record_created": "2017-11-01T00:43:47.072Z",
			"bank_is_record_updated": true,
			"bank_record_updated": "2017-10-01T00:43:47.072Z"
		},
		"sort": [1506818627072]
	}, {
		"_index": "banks_index_v1",
		"_type": "base_type",
		"_id": "AV9644fZiZHTo3raAYJm",
		"_score": null,
		"_routing": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
		"_source": {
			"bank_userId_routingAliasId": "Iq63rGKy2MUT4QmCWf0ewJJIxWC3",
			"bank_providerName": "bankBody.bank_providerName",
			"bank_providerAccountId": "bankBody.bank_providerAccountId",
			"bank_providerIdentifier": "bankBody.bank_providerIdentifier",
			"bank_isBankAccountActive": "bankBody.bank_isBankAccountActive",
			"bank_isBankAccountVerified": "bankBody.bank_isBankAccountVerified",
			"bank_additonalBankNotes": "bankBody.bank_additonalBankNotes",
			"bank_refreshInfo": "bankBody.bank_refreshInfo",
			"bank_refreshInfo_statusCode": "bankBody.bank_refreshInfoStatusCode",
			"bank_refreshInfo_statusMessage": "bankBody.bank_refreshInfoStatusMessage",
			"bank_refreshInfo_status": "bankBody.bank_refreshInfo_status",
			"bank_isManual": true,
			"bank_createdDate": "2017-11-01T00:43:47.072Z",
			"bank_lastUpdated": false,
			"bank_isAutoRefreshEnabled": false,
			"bank_numberOfTransactionDays": "bankBody.bank_numberOfTransactionDays",
			"bank_bankAccountName": "bankBody.bank_bankAccountName",
			"bank_bankAccountNumber": 3456789,
			"bank_BSB": 3333333,
			"bank_Branch": "bankBody.bank_Branch",
			"bank_BranchNumber": 12345678910,
			"bank_amountDue": 4.4,
			"bank_availableBalance": 3.3,
			"bank_availableCash": 2.2,
			"bank_availableCredit": 1.1,
			"bank_nickname": "bankBody.bank_nickname",
			"bank_status": "bankBody.bank_status",
			"bank_record_created": "2017-11-01T00:43:47.072Z",
			"bank_is_record_updated": true,
			"bank_record_updated": "2017-10-01T00:43:47.072Z"
		},
		"sort": [1506818627072]
	}
]
}
*/
