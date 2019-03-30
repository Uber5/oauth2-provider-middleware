/* eslint-disable import/no-extraneous-dependencies */

// require your own version of express, passport, express-session and body-parser
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');

// What we need from *this* package...
const { buildRouter } = require('../src');

function buildApp({ store }) {
  // instantiate the express app
  const app = express();

  // you need to setup session, bodyParser, and passport *before* adding the oauth2 router
  app.use(session({ secret: 'do not tell', resave: true, saveUninitialized: true }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());

  // The only view required is for logging in, see /login route below
  // we use views from the ./views directory
  app.set('view engine', 'ejs');
  app.set('views', './sample/views');

  const authRouter = buildRouter({ express, store });

  app.use(authRouter);

  app.get('/login', (req, res, next) => res.render('login', { bla: 42 }));

  return app;
}

module.exports = buildApp;
