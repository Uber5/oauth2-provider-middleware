/* eslint-disable import/no-extraneous-dependencies */

// require your own version of express, passport, express-session and body-parser
const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

function buildCodeClient({ provider, client }) {
  // instantiate the express app
  // const app = express();
  // app.use(passport.initialize()); // Used to initialize passport
  // app.use(passport.session()); // Used to persist login sessions
  // const { client_id, client_secret, redirect_uris } = client;
  // const clientId = client_id;
  // const redirectUri = redirect_uris[0];
  // // Strategy config
  // passport.use(
  //   'oauth2',
  //   new OAuth2Strategy(
  //     {
  //       authorizationURL: `${provider}/authorize`,
  //       tokenURL: `${provider}/access_token`,
  //       clientID: client_id,
  //       clientSecret: client_secret,
  //       callbackURL: redirectUri
  //     },
  //     function(accessToken, refreshToken, profile, done) {
  //       console.log('Access token', accessToken);
  //       console.log('Refresh token', refreshToken);
  //       done(null, profile); // passes the profile data to serializeUser
  //     }
  //   )
  // );
  // // Used to stuff a piece of information into a cookie
  // passport.serializeUser((user, done) => {
  //   done(null, user);
  // });
  // // Used to decode the received cookie and persist session
  // passport.deserializeUser((user, done) => {
  //   done(null, user);
  // });
  // Routes
  // The passport.authenticate middleware is used here to authenticate the request and runs the function on Strategy config
  // The only view required is for logging in, see /login route below
  // we use views from the ./views directory
  // app.set('view engine', 'ejs');
  // app.set('views', './code-sample-client/views');
  // app.get('/', (req, res) => res.render('index', { provider, clientId }));
  // app.get('/login', passport.authenticate('oauth2'));
  // app.get(
  //   '/auth',
  //   passport.authenticate('oauth2', {
  //     successRedirect: '/',
  //     failureRedirect: '/login'
  //   })
  // );
  // return app;
}

module.exports = buildCodeClient;
