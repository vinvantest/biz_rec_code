'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
var functions = require('firebase-functions');
var elasticsearch = require('elasticsearch');
const cors = require('cors')({origin: true});

// The Firebase Admin SDK to access the Firebase Realtime Database.
var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var database = admin.database();

/*****     ELASTICSEARCH SERVER CLIENT ***********/
var auth = functions.config().elasticsearch.es_auth;
var port = functions.config().elasticsearch.es_port;
var protocol = functions.config().elasticsearch.es_protocolt;
var log = functions.config().elasticsearch.es_log;
var hostUrls = [
      functions.config().elasticsearch.es_hosturls_0,
      functions.config().elasticsearch.es_hosturls_1,
      functions.config().elasticsearch.es_hosturls_2,
      functions.config().elasticsearch.es_hosturls_3
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

/***********    FUNCTIONS Dummy     *********************/
var fooFunction = require('./util/foo');
var barFunction = require('./util/bar');

/***********   SETUP FUNCTIONS     *********************/
var deleteIndexFunction = require('./setup_functions/deleteIndex');
var deleteTemplateFunction = require('./setup_functions/deleteTemplate');
var addTemplateToESFunction = require('./setup_functions/addTemplateToES');
var createIndexFunction = require('./setup_functions/createIndex');

/***********   UTIL FUNCTIONS     *********************/
var createIndexAliasBasedOnRoutingFunction = require('./util/createIndexAliasBasedOnRouting');

/***********   BANKS FUNCTIONS     *********************/
var createBankFunction = require('./banks/createBank');
var getBanksFunction = require('./banks/getBanks');
var getBankFunction = require('./banks/getBank');

/***********   COAS FUNCTIONS     *********************/
var createCoaFunction = require('./coas/createCoa');
var getCoasFunction = require('./coas/getCoas');
var getCoaFunction = require('./coas/getCoa');

/***********   CUSTOMERS FUNCTIONS     *********************/
var createCustomerFunction = require('./customers/createCustomer');
var getCustomersFunction = require('./customers/getCustomers');
var getCustomerFunction = require('./customers/getCustomer');

/***********   INVOICES FUNCTIONS     *********************/
var createInvoiceFunction = require('./invoices/createInvoice');
var getInvoicesFunction = require('./invoices/getInvoices');
var getInvoiceFunction = require('./invoices/getInvoice');

/***********   PAYMENTS FUNCTIONS     *********************/
var createPaymentFunction = require('./payments/createPayment');
var getPaymentsFunction = require('./payments/getPayments');
var getPaymentFunction = require('./payments/getPayment');

/***********   RULES FUNCTIONS     *********************/
var createRuleFunction = require('./rules/createRule');
var getRulesFunction = require('./rules/getRules');
var getRuleFunction = require('./rules/getRule');

/***********   SUPPLIERS FUNCTIONS     *********************/
var createSupplierFunction = require('./suppliers/createSupplier');
var getSuppliersFunction = require('./suppliers/getSuppliers');
var getSupplierFunction = require('./suppliers/getSupplier');

/***********   Settings FUNCTIONS     *********************/
var createSettingFunction = require('./settings/createSetting');
var getSettingFunction = require('./settings/getSetting');
var getSettingsFunction = require('./settings/getSettings');

/***********   TRANSACTIONS FUNCTIONS     *********************/
var createTransactionFunction = require('./transactions/createTransaction');
var getTransactionsFunction = require('./transactions/getTransactions');
var getTransactionFunction = require('./transactions/getTransaction');

/***********   USERS FUNCTIONS     *********************/
var checkUserExistsFunction = require('./users/checkUserExists');
var createUserFunction = require('./users/createUser');
var getUserFunction = require('./users/getUser');
var getUsersFunction = require('./users/getUsers');
var deleteUserFunction = require('./users/deleteUser');

/***********   DATABASE TRIGGERS FUNCTIONS     *********************/
var databaseTrigger1Function = require('./database_triggers/databaseTrigger1');
var databaseTrigger2Function = require('./database_triggers/databaseTrigger2');

/***********   AUTH TRIGGERS FUNCTIONS     *********************/
var createUserOnAuthFunction = require('./auth_triggers/createUserOnAuth');
var createBankIndexAliasForUserFunction = require('./auth_triggers/createBankIndexAliasForUser');
var createCAOIndexAliasForUserFunction = require('./auth_triggers/createCAOIndexAliasForUser');
var createCustomerIndexAliasForUserFunction = require('./auth_triggers/createCustomerIndexAliasForUser');
var createInvoiceIndexAliasForUserFunction = require('./auth_triggers/createInvoiceIndexAliasForUser');
var createNoteIndexAliasForUserFunction = require('./auth_triggers/createNoteIndexAliasForUser');
var createPaymentIndexAliasForUserFunction = require('./auth_triggers/createPaymentIndexAliasForUser');
var createRuleIndexAliasForUserFunction = require('./auth_triggers/createRuleIndexAliasForUser');
var createSettingIndexAliasForUserFunction = require('./auth_triggers/createSettingIndexAliasForUser');
var createSupplierIndexAliasForUserFunction = require('./auth_triggers/createSupplierIndexAliasForUser');
var createTransactionIndexAliasForUserFunction = require('./auth_triggers/createTransactionIndexAliasForUser');

/***********   EMAILS FUNCTIONS     *********************/
var sendWelcomeEmailFunction = require('./emails/sendWelcomeEmail');
var sendByeEmailFunction = require('./emails/sendByeEmail');

/***********   TEST FUNCTIONS     *********************/
var testSendMailFunction = require('./test_functions/testSendMail');
var testAliasCreationFunction = require('./test_functions/testAliasCreation');



/*********** Dummy Functions ****************/


exports.fooFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
            fooFunction.handler(req, res, database, esClient);
        });
});

exports.barFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        barFunction.handler(req, res, database, esClient);
    });
});

/************** USER ***********************/

exports.getUserFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getUserFunction.handler(req, res, database, esClient);
    });
});

exports.getUsersFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getUsersFunction.handler(req, res, database, esClient);
    });
});

exports.checkUserExistsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
           checkUserExistsFunction.handler(req, res, database, esClient);
         });
});

exports.createUserFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
           createUserFunction.handler(req, res, database, esClient);
         });
});

/************** Setup ***********************/

exports.addTemplateToESFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        addTemplateToESFunction.handler(req, res, database, esClient);
    });
});

exports.createIndexFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createIndexFunction.handler(req, res, database, esClient);
    });
});

exports.createIndexAliasBasedOnRoutingFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createIndexAliasBasedOnRoutingFunction.handler(req, res, database, esClient);
    });
});

/************** Bank ***********************/

exports.getBanksFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getBanksFunction.handler(req, res, database, esClient);
    });
});

exports.getBankFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getBankFunction.handler(req, res, database, esClient);
    });
});

exports.createBankFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createBankFunction.handler(req, res, database, esClient);
    });
});

/************** Customer ***********************/

exports.getCustomersFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getCustomersFunction.handler(req, res, database, esClient);
    });
});

exports.getCustomerFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getCustomerFunction.handler(req, res, database, esClient);
    });
});

exports.createCustomerFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createCustomerFunction.handler(req, res, database, esClient);
    });
});

/************** Invoice ***********************/

exports.getInvoicesFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getInvoicesFunction.handler(req, res, database, esClient);
    });
});

exports.getInvoiceFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getInvoiceFunction.handler(req, res, database, esClient);
    });
});

exports.createInvoiceFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createInvoiceFunction.handler(req, res, database, esClient);
    });
});

/************** Paymnent ***********************/

exports.getPaymentsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getPaymentsFunction.handler(req, res, database, esClient);
    });
});

exports.getPaymentFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getPaymentFunction.handler(req, res, database, esClient);
    });
});

exports.createPaymentFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createPaymentFunction.handler(req, res, database, esClient);
    });
});

/************** suppliers ***********************/

exports.getSuppliersFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getSuppliersFunction.handler(req, res, database, esClient);
    });
});

exports.getSupplierFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getSupplierFunction.handler(req, res, database, esClient);
    });
});

exports.createSupplierFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createSupplierFunction.handler(req, res, database, esClient);
    });
});

/************** Settings ***********************/

exports.getSettingFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getSettingFunction.handler(req, res, database, esClient);
    });
});

exports.getSettingsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getSettingsFunction.handler(req, res, database, esClient);
    });
});

exports.createSettingFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createSettingFunction.handler(req, res, database, esClient);
    });
});

/************** transactions ***********************/

exports.getTransactionsFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getTransactionsFunction.handler(req, res, database, esClient);
    });
});

exports.getTransactionFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        getTransactionFunction.handler(req, res, database, esClient);
    });
});

exports.createTransactionFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        createTransactionFunction.handler(req, res, database, esClient);
    });
});

/************ DELETE FUNCTIONS **************************************/

exports.deleteTemplateFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        deleteTemplateFunction.handler(req, res, database, esClient);
    });
});

exports.deleteUserFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        deleteUserFunction.handler(req, res, database, esClient);
    });
});

exports.deleteIndexFunction = functions.https.onRequest((req, res) => {
    //var corsFn = cors();
    //corsFn(req, res, () => {
    cors(req, res, () => {
        deleteIndexFunction.handler(req, res, database, esClient);
    });
});

/************ BACKEND TRIGGERED FUNCTIONS - DATABASE Path ***********/

exports.databaseTrigger1Function = functions.database.ref('/users/{uid}/profile')
.onWrite( event => {
  databaseTrigger1Function.handler(event, database, esClient);
});


exports.databaseTrigger2Function = functions.database.ref('/users/{uid}/profile')
.onWrite( event => {
  databaseTrigger2Function.handler(event, database, esClient);
});

/************ ### TEST BACKEND TRIGGERED FUNCTIONS ### ***********/

exports.testSendMailFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        testSendMailFunction.handler(req, res, database, functions);
    });
});

exports.testAliasCreationFunction = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        testAliasCreationFunction.handler(req, res, database, esClient);
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
    createBankIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createCAOIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createCAOIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createCustomerIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createCustomerIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createInvoiceIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createInvoiceIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createNoteIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createNoteIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createPaymentIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createPaymentIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createRuleIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createRuleIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createSettingIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createSettingIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createSupplierIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createSupplierIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createTransactionIndexAliasForUserFunction = functions.auth.user().onCreate(event => {
    createTransactionIndexAliasForUserFunction.handler(event, database, esClient);
});

exports.createUserOnAuthFunction = functions.auth.user().onCreate(event => {
    createUserOnAuthFunction.handler(event, database, esClient);
});
