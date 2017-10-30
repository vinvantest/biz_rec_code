'use strict';

var config  = require('./config.js');

const sendgrid = require('sendgrid');
const APP_NAME = config.email_app_name;

exports.handler = function(event, database)
{
  const clientSendGrid = sendgrid(functions.config().sendgrid.key);
  
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
            "subject": `Welcome to ${APP_NAME}!`
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
        "subject": `Welcome to ${APP_NAME}!`,
        "template_id": config.email_welcome_template_id
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
