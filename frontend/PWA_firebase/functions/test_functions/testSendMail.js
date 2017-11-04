'use strict';

var esClient = require('../config/elasticsearch/elasticConfig.js');
var config  = require('../config.js');
var helper = require('../config/helpers/helper.js');

const sendgrid = require('sendgrid');
const APP_NAME = config.email_app_name;

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

function parseBody(email, displayName, templateId) {
    var contentText = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`;
    var helper = sendgrid.mail;
    var fromEmail = new helper.Email(config.email_from);
    var toEmail = new helper.Email(email);
    var subject = `Welcome to ${APP_NAME}! - via SendGrid`;
    var html = '<p></p>';
    //var content = new helper.Content('text/html', html);
    //var mail = new helper.Mail(fromEmail, subject, toEmail, content);
    //template id = 209b701b-0921-4ef4-aa94-3d5d9d93d617
    var mail = new helper.Mail(fromEmail, subject, toEmail);
    var substitution = new helper.Substitution("%name%", displayName);
    const personalization = new helper.Personalization();
    personalization.addSubstitution(substitution);
  //  personalization.addSubject(subject);
    mail.addPersonalization(personalization);
    mail.setTemplateId(templateId);
    console.log('mai.toJSON() ->' + JSON.stringify(mail.toJSON()) );
    //return  mail.toJSON();
    var obj = {
      "personalizations": [
        {
        "to": [
            {
              "email": "vinayak.vanarse@gmail.com",
              "name": "Vin Doe"}
          ],
           "substitutions": {
              "%name%": "Vin Doe"
          },
          "subject": "SendGrid Test - Vin Welcome"
        }
      ],
      "from": {
        "email": "ramhanse@gmail.com",
        "name": "BizRec"
      },
      "reply_to": {
        "email": "email@example.com",
        "name": "Sam Smith"
      },
      "subject": "SendGrid Test - Vin Welcome!",
      "template_id": config.email_bye_template_id
    };
    return obj;
  }

//https://us-central1-bizrec-dev.cloudfunctions.net/getBankFunction?uid=HJIOFS#53345DD&bankId=HLH343HS52
//no body {} -- banks body
function handleGET (req, res, functions)
{
  // Do something with the GET request
  const email = req.query.email; // The email of the user.
  const displayName = req.query.displayName; // The display name of the user.
  //const templateId = config.email_welcome_template_id;
  //console.log( 'event data =' + JSON.stringify(req) );

  //Send via nodemailer !
  //eturn sendWelcomeEmail(email, displayName); //uncomment if you need only nodemailer. return is required.
  //sendWelcomeEmail(email, displayName);
  /****** END: Setup for Nodemailer  ********/

  /******** SendGrid SETUP *********/

  //send via SendGrid !
  /*return Promise.resolve()
    .then(() => {

      const request = clientSendGrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: parseBody(email, displayName, templateId)
      });
      return clientSendGrid.API(request)
    })
    .then((response) => {
      console.log('Sendgrid :: response.statusCode = '+ resonse.statusCode);
      console.log('SendGrid :: Response after sending email successfully - Welcome Email Operation!');
      console.log('SendGrid :: response = '+JSON.stringify(response));
      console.log('respnose.body = '+ response.body);
      //if (response.body) {
        console.log('SendGrid :: Email successfully sent on account creation!');
    })
    .catch((err) => {
      console.error('SendGrid :: Internal Server Error - ' + err);
      return Promise.reject(err);
    });
    */
    const clientSendGrid = sendgrid(functions.config().sendgrid.key);
    // Put everything together into an email request object
    const request = clientSendGrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: parseBody(email, displayName, config.email_welcome_template_id),
    });
    // Send the email!
    clientSendGrid.API(request, function (error, response) {
      if (error) {
         console.log('Error response received -' + error);
         helper.failure(res, error, 500);
       }
       else {
         console.log('Sendgrid :: response.statusCode = '+ response.statusCode);
         console.log('SendGrid :: Response after sending email successfully - Welcome Email Operation!');
         console.log('SendGrid :: response = '+JSON.stringify(response));
         console.log('respnose.body = '+ response.body);
         console.log('response.headers' + response.headers);
         helper.success(res, 'Successfully sent email');
       }
    });

}

exports.handler = function(req, res, database, functions)
{
  var usersRef = database.ref('users');
  switch (req.method) {
  case 'GET':
    handleGET(req, res, functions);
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
{

	"personalizations": [
        {
    		"to": [{
    			"email": "vinayak.vanarse@gmail.com"
    		}]
    	}, {
    		"substitutions": {
    			"%name%": "testvin"
    		}
    	}
    ],
    "from": {
      "email": "BizRec <ramhanse@gmail.com>"
    },
	"subject": "Welcome to BizRec! - via SendGrid",
	"content": [{
		"type": "text/html",
		"value": "<p></p>"
	}],
	"template_id": "209b701b-0921-4ef4-aa94-3d5d9d93d617"
}

--- her

{
  "personalizations": [
    {
    "to": [
        {
          "email": "sendgridtesting@gmail.com",
          "name": "John Doe"}
      ],
       "substitutions": {
          "%name%": "Test"
      },
      "subject": "SendGrid Test"
    }
  ],
  "from": {
    "email": "sendgridtesting@gmail.com",
    "name": "Sam Smith"
  },
  "reply_to": {
    "email": "email@example.com",
    "name": "Sam Smith"
  },
  "subject": "SendGrid Test",
  "template_id": "209b701b-0921-4ef4-aa94-3d5d9d93d617"
}
*/
