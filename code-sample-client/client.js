/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

// require your own version of express, passport, express-session and body-parser
const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

function buildCodeClient({ provider, client }) {
  // instantiate the express app
  const app = express();
  app.use(passport.initialize()); // Used to initialize passport
  app.use(passport.session()); // Used to persist login sessions
  // eslint-disable-next-line camelcase
  const { client_id, client_secret, redirect_uris } = client;
  const redirectUri = redirect_uris[0];
  // Strategy config
  passport.use(
    'oauth2',
    new OAuth2Strategy(
      {
        authorizationURL: `${provider}/authorize`,
        tokenURL: `${provider}/token`,
        clientID: client_id,
        clientSecret: client_secret,
        callbackURL: redirectUri
      },
      function loggedIn(accessToken, refreshToken, profile, done) {
        console.log('Access token', accessToken);
        console.log('Refresh token', refreshToken);
        done(null, profile); // passes the profile data to serializeUser
      }
    )
  );
  // Used to stuff a piece of information into a cookie
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  // Used to decode the received cookie and persist session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  // Routes
  // The passport.authenticate middleware is used here to authenticate the request and runs the function on Strategy config
  // The only view required is for logging in, see /login route below
  // we use views from the ./views directory
  app.set('view engine', 'ejs');
  app.set('views', './code-sample-client/views');
  app.get('/', (req, res) => {
    console.log('code client, render index, req.user', req.user);
    res.render('index', { isLoggedIn: !!req.user });
  });
  app.post('/', (req, res) => res.redirect('/logged-in'));
  app.get('/logged-in', passport.authenticate('oauth2'), (req, res) => {
    console.log('code client, render index, req.user', req.user);
    res.render('index', { isLoggedIn: !!req.user });
  });
  // app.get(
  //   '/auth',
  //   passport.authenticate('oauth2', {
  //     successRedirect: '/logged-in',
  //     failureRedirect: '/login'
  //   })
  // );
  return app;
}

module.exports = buildCodeClient;
