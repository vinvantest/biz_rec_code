'use strict';

function handleGET (req, res) {
  // Do something with the GET request
  res.status(200).send('Hello World! ... foo ran successfully');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

exports.handler = function(req, res, database) {
      // Use database to declare databaseRefs:
      let usersRef = database.ref('users');
      switch (req.method) {
      case 'GET':
        handleGET(req, res);
        break;
      case 'PUT':
        handlePUT(req, res);
        break;
      default:
        res.status(500).send({ error: 'Something blew up!' });
        break;
      }
   }
