'use strict';

const nodemailer = require('nodemailer');
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.

//const gmailEmail = encodeURIComponent(functions.config().gmail.email);
//const gmailPassword = encodeURIComponent(functions.config().gmail.password);
//const mailTransport = nodemailer.createTransport(
//    `smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

const mailTransport = nodemailer.createTransport(
    `smtps://ramhanse@gmail.com:ramhanse1@smtp.gmail.com`);
// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'BizRec';

// Sends a goodbye email to the given user.
function sendGoodbyEmail(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email
  };

  // The user unsubscribed to the newsletter.
  mailOptions.subject = `Bye!`;
  mailOptions.text = `Hey ${displayName || ''}!, We confirm that we have deleted your ${APP_NAME} account.`;
  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('Account deletion confirmation email sent to:', email);
  });
}

exports.handler = function(event, database)
{
  var usersRef = database.ref('users');
  // [END onDeleteTrigger]
  const user = event.data;
  const email = user.email;
  const displayName = user.displayName;
  console.log( 'event data ='+JSON.stringify(event.data.val()) );

  return sendGoodbyEmail(email, displayName);
};
