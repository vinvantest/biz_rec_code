'use strict';

function _respondSuccess(res, status, data, httpCode) {
     var response = {
       'status': status,
       'successFlag' : true,
       'data' : data
     };
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', '*');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', '*');
     res.set('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
     res.set('Access-Control-Max-Age', '1000');
     res.status(httpCode).send(response);
}

function _respondArraySuccess(res, status, data, httpCode) {

     var response = {
       'status' : status,
       'successFlag' : true,
       'data' : [data]
     };
     res.set('Content-type', 'application/json');
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', '*');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', '*');
     res.set('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
     res.set('Access-Control-Max-Age', '1000');
    res.status(httpCode).send(response);
}

function _respondFailure(res, status, data, httpCode) {
     var response = {
       'status': status,
       'successFlag' : false,
       'data' : data
     };
     res.set('Content-type', 'application/json');
     res.set('Access-Control-Allow-Origin', '*');
     res.set('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
     res.set('Access-Control-Allow-Methods', '*');
     res.set('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
     res.set('Access-Control-Max-Age', '1000');
     res.status(httpCode).send(response);
}

module.exports.success = function success (res, data) {
 _respondSuccess(res, 'success', data, 200);
}

module.exports.successArray = function successArray (res, data) {
 _respondArraySuccess(res, 'success', data, 200);
}

module.exports.failure = function failure (res, data, httpCode) {
 console.log('Error: ' + httpCode + ' ' + data);
 _respondFailure(res, 'failure', data, httpCode);
}
