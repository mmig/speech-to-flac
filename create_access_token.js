// Node.js script for generating OAuth 2.0 bearer/access_token
//
// * dependencies: install npm package googleapis, i.e. run:
//
// npm install googleapis
//
// * set the path to your API secret (see comments below)
// * run script, and use generated access token from console output
//
// node create_access_token.js
//
// * additional information:
//   * [Service accounts] https://cloud.google.com/docs/authentication/
//   * https://github.com/google/google-api-nodejs-client#using-jwt-service-tokens


var google = require('googleapis');

var key = require('/path/to/key.json');//set path to JSON file with your API secret (see Google docs about authentification)
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/cloud-platform'],
  null
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  }

  var cred = jwtClient.credentials;
  console.log('use authentification: '+cred.token_type+' '+cred.access_token);
});
