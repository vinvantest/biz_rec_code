'use strict';

var config  = require('./config.js');

const sendgrid = require('sendgrid');
const clientSendGrid = sendgrid(config.email_sendgrid_apikey_template);

const APP_NAME = config.email_app_name;

exports.handler = function(event, database)
{
  var usersRef = database.ref('users');
  const user = event.data; // The Firebase user.
  console.log( 'event data ='+JSON.stringify(event.data) );
  var obj = {
        "personalizations": [
          {
          "to": [
              {
                "email": user.email,
                "name": user.displayName
              }
            ],
             "substitutions": {
                "%name%": user.displayName
            },
            "subject": `Bye ${APP_NAME}!`
          }
        ],
        "from": {
          "email": config.email_from,
          "name": APP_NAME
        },
        "reply_to": {
          "email": config.email_customer_service,
          "name": "Bizrec Customer Service"
        },
        "subject": `Bye ${APP_NAME}!`,
        "template_id": config.email_bye_template_id
      };
  const request = clientSendGrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: obj,
  });
  // Send the email!
  clientSendGrid.API(request, function (error, response) {
        if (error) {
           console.log('Error response received -' + error);
           return;
         }
         else {
           console.log('Sendgrid :: response.statusCode = '+ response.statusCode);
           console.log('SendGrid :: Response after sending email successfully - Welcome Email Operation!');
           console.log('SendGrid :: response = '+JSON.stringify(response));
           console.log('respnose.body = '+ response.body);
           console.log('response.headers' + response.headers);
           return;
         }
      });
  return;
};
