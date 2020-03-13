/* eslint-disable func-names */
/* eslint-disable import/no-extraneous-dependencies */

// require your own version of express, passport, express-session and body-parser
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const configurePassport = require('./configure-passport');

// What we need from *this* package...
const { buildRouter } = require('../src');

function buildApp({ store }) {
  // instantiate the express app
  const app = express();

  // you need to setup session, bodyParser, and passport *before* adding the oauth2 router
  app.use(session({ secret: 'do not tell', resave: true, saveUninitialized: true }));
  app.use(bodyParser.urlencoded({ extended: false }));
  configurePassport(passport, store);
  app.use(passport.initialize());
  app.use(passport.session());

  // The only view required is for logging in, see /login route below
  // we use views from the ./views directory
  app.set('view engine', 'ejs');
  app.set('views', './sample/views');

  const authRouter = buildRouter({ express, store });

  app.use(authRouter);

  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.urlAfterLogin = req.url;
    return res.redirect('/login');
  };

  app.get('/profile', authenticated, (req, res, next) => res.render('profile', { user: req.user }));
  app.get('/login', (req, res, next) => res.render('login', { message: null }));
  app.post('/login', (req, res, next) =>
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render('login', info);
      }
      return req.logIn(user, function(_err) {
        if (_err) {
          return next(_err);
        }
        const url = req.session.urlAfterLogin;
        delete req.session.urlAfterLogin;
        return res.redirect(url);
      });
    })(req, res, next)
  );
  app.get('/logout', authenticated, (req, res) => res.render('logout'));
  app.post('/logout', authenticated, (req, res) => {
    req.logout();
    res.redirect('/login');
  });
  return app;
}

module.exports = buildApp;
