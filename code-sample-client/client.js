/* eslint-disable import/no-extraneous-dependencies */

// require your own version of express, passport, express-session and body-parser
const express = require('express');

function buildCodeClient({ provider, clientId }) {
  // instantiate the express app
  const app = express();

  // The only view required is for logging in, see /login route below
  // we use views from the ./views directory
  app.set('view engine', 'ejs');
  app.set('views', './code-sample-client/views');

  app.get('/', (req, res) => res.render('index', { provider, clientId }));

  return app;
}

module.exports = buildCodeClient;
