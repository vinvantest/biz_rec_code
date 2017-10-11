'use strict';

var fooFunction = require('./foo');
var barFunction = require('./bar');
var getUsersFunction = require('./getUsers');
var createIndexESFunction = require('./createIndexES');
var addTemplateToESFunction = require('./addTemplateToES');
var createIndexFunction = require('./createIndex');
var createIndexAliasByRounting = require('./createIndexAliasByRounting');


// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
var functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var database = admin.database();

// Pass database to child functions so they have access to it
exports.fooFunction = functions.https.onRequest((req, res) => {
    fooFunction.handler(req, res, database);
});

exports.barFunction = functions.https.onRequest((req, res) => {
    barFunction.handler(req, res, database);
});

exports.getUsersFunction = functions.https.onRequest((req, res) => {
    getUsersFunction.handler(req, res, database);
});

exports.createIndexESFunction = functions.https.onRequest((req, res) => {
    createIndexESFunction.handler(req, res, database);
});

exports.addTemplateToESFunction = functions.https.onRequest((req, res) => {
    addTemplateToESFunction.handler(req, res, database);
});

exports.createIndexFunction = functions.https.onRequest((req, res) => {
    createIndexFunction.handler(req, res, database);
});

exports.createIndexAliasByRounting = functions.https.onRequest((req, res) => {
    createIndexAliasByRounting.handler(req, res, database);
});
