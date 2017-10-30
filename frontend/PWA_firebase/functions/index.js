'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
var functions = require('firebase-functions');
const cors = require('cors')({origin: true});

//Env.variable keys
/*
return request({
    url: 'https://someservice.com/api/some/call',
    headers: {
      'X-Client-ID': functions.config().someservice.id,
      'Authorization': `Bearer ${functions.config().someservice.key}`
    },
    body: {email: email}
  });
*/
// The Firebase Admin SDK to access the Firebase Realtime Database.
var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var database = admin.database();

var fooFunction = require('./foo');
var barFunction = require('./bar');

var getUsersFunction = require('./getUsers');
var addTemplateToESFunction = require('./addTemplateToES');
var createIndexFunction = require('./createIndex');
var createIndexAliasBasedOnRoutingFunction = require('./createIndexAliasBasedOnRouting');
var createInvoiceFunction = require('./createInvoice');
var getBanksFunction = require('./getBanks');
var getBankFunction = require('./getBank');
var getCoasFunction = require('./getCoas');
var getCoaFunction = require('./getCoa');
var getCustomersFunction = require('./getCustomers');
var getCustomerFunction = require('./getCustomer');
var getInvoicesFunction = require('./getInvoices');
var getInvoiceFunction = require('./getInvoice');
var getPaymentsFunction = require('./getPayments');
var getPaymentFunction = require('./getPayment');
var getRulesFunction = require('./getRules');
var getRuleFunction = require('./getRule');
var getSuppliersFunction = require('./getSuppliers');
var getSupplierFunction = require('./getSupplier');
var getTransactionsFunction = require('./getTransactions');
var getTransactionFunction = require('./getTransaction');
var checkUserExistsFunction = require('./checkUserExists');
var createUserFunction = require('./createUser');
var deleteIndexFunction = require('./deleteIndex');
var deleteTemplateFunction = require('./deleteTemplate');

var databaseTrigger1Function = require('./databaseTrigger1');
var databaseTrigger2Function = require('./databaseTrigger2');

var createUserOnAuthFunction = require('./createUserOnAuth');
var createBankIndexAliasForUserFunction = require('./createBankIndexAliasForUser');
var createCAOIndexAliasForUserFunction = require('./createCAOIndexAliasForUser');
var createCustomerIndexAliasForUserFunction = require('./createCustomerIndexAliasForUser');
var createInvoiceIndexAliasForUserFunction = require('./createInvoiceIndexAliasForUser');
var createNoteIndexAliasForUserFunction = require('./createNoteIndexAliasForUser');
var createPaymentIndexAliasForUserFunction = require('./createPaymentIndexAliasForUser');
var createRuleIndexAliasForUserFunction = require('./createRuleIndexAliasForUser');
var createSettingIndexAliasForUserFunction = require('./createSettingIndexAliasForUser');
var createSupplierIndexAliasForUserFunction = require('./createSupplierIndexAliasForUser');
var createTransactionIndexAliasForUserFunction = require('./createTransactionIndexAliasForUser');

var sendWelcomeEmailFunction = require('./sendWelcomeEmail');
var sendByeEmailFunction = require('./sendByeEmail');

var testSendMailFunction = require('./testSendMail');
var testAliasCreationFunction = require('./testAliasCreation');

// Pass database to child functions so they have access to it
exports.fooFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
            fooFunction.handler(req, res, database);
        });
});

exports.barFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        barFunction.handler(req, res, database);
    });
});

exports.getUsersFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getUsersFunction.handler(req, res, database);
    });
});

exports.addTemplateToESFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        addTemplateToESFunction.handler(req, res, database);
    });
});

exports.createIndexFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createIndexFunction.handler(req, res, database);
    });
});

exports.createIndexAliasBasedOnRoutingFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createIndexAliasBasedOnRoutingFunction.handler(req, res, database);
    });
});

exports.createInvoiceFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createInvoiceFunction.handler(req, res, database);
    });
});

exports.getBanksFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getBanksFunction.handler(req, res, database);
    });
});

exports.getBankFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getBankFunction.handler(req, res, database);
    });
});

exports.getCustomersFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getCustomersFunction.handler(req, res, database);
    });
});

exports.getCustomerFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getCustomerFunction.handler(req, res, database);
    });
});

exports.getInvoicesFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getInvoicesFunction.handler(req, res, database);
    });
});

exports.getInvoiceFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getInvoiceFunction.handler(req, res, database);
    });
});

exports.getPaymentsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getPaymentsFunction.handler(req, res, database);
    });
});

exports.getPaymentFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getPaymentFunction.handler(req, res, database);
    });
});

exports.getSuppliersFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getSuppliersFunction.handler(req, res, database);
    });
});

exports.getSupplierFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getSupplierFunction.handler(req, res, database);
    });
});

exports.getTransactionsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getTransactionsFunction.handler(req, res, database);
    });
});

exports.getTransactionFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getTransactionFunction.handler(req, res, database);
    });
});

exports.checkUserExistsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
           checkUserExistsFunction.handler(req, res, database);
         });
});

exports.createUserFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
           createUserFunction.handler(req, res, database);
         });
});

exports.deleteTemplateFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        deleteTemplateFunction.handler(req, res, database);
    });
});

exports.deleteIndexFunction = functions.https.onRequest((req, res) => {
    //var corsFn = cors();
    //corsFn(req, res, () => {
    cors(req, res, () => {
        deleteIndexFunction.handler(req, res, database);
    });
});

/************ BACKEND TRIGGERED FUNCTIONS - DATABASE Path ***********/

exports.databaseTrigger1Function = functions.database.ref('/users/{uid}/profile')
.onWrite( event => {
  databaseTrigger1Function.handler(event, database);
});


exports.databaseTrigger2Function = functions.database.ref('/users/{uid}/profile')
.onWrite( event => {
  databaseTrigger2Function.handler(event, database);
});

/************ ### TEST BACKEND TRIGGERED FUNCTIONS ### ***********/

exports.testSendMailFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        testSendMailFunction.handler(req, res, database, functions);
    });
});

exports.testAliasCreationFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        testAliasCreationFunction.handler(req, res, database);
    });
});

/************ SEND EMAILS ON AUTHENTICATION - SENDGRID BACKEND FUNCTION *******/

exports.sendWelcomeEmailFunction = functions.auth.user().onCreate(event => {
    sendWelcomeEmailFunction.handler(event, database, functions);
});

exports.sendByeEmailFunction = functions.auth.user().onDelete(event => {
    sendByeEmailFunction.handler(event, database, functions);
});

/************ SETUP ALIAS for logged in customer AUTHENTICATION - BACKEND FUNCTION *******/

exports.createBankIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createBankIndexAliasForUserFunction.handler(event, database);
});

exports.createCAOIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createCAOIndexAliasForUserFunction.handler(event, database);
});

exports.createCustomerIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createCustomerIndexAliasForUserFunction.handler(event, database);
});

exports.createInvoiceIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createInvoiceIndexAliasForUserFunction.handler(event, database);
});

exports.createNoteIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createNoteIndexAliasForUserFunction.handler(event, database);
});

exports.createPaymentIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createPaymentIndexAliasForUserFunction.handler(event, database);
});

exports.createRuleIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createRuleIndexAliasForUserFunction.handler(event, database);
});

exports.createSettingIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createSettingIndexAliasForUserFunction.handler(event, database);
});

exports.createSupplierIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createSupplierIndexAliasForUserFunction.handler(event, database);
});

exports.createTransactionIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createTransactionIndexAliasForUserFunction.handler(event, database);
});

exports.createUserOnAuthFunction = functions.auth.user().onCreate(event => {
    createUserOnAuthFunction.handler(event, database);
});
