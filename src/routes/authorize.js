/* eslint-disable camelcase */
const { ok } = require('assert');
const ensureValidAuthorizeRequest = require('../validation/ensure-valid-authorize-request');
const ensureValidClient = require('../validation/ensure-valid-client');
const isRedirectUriAllowed = require('../lib/is-redirect-uri-allowed');

function uriQuerySeparator(uri) {
  return uri.match(/\?/) ? '&' : '?';
}

function uriFragmentSeparator(uri) {
  return uri.match(/#/) ? '&' : '#';
}

function redirectWithCode(res, auth, redirect_uri, state) {
  let dest = `${redirect_uri}${uriQuerySeparator(redirect_uri)}code=${auth.code}`;
  if (state) {
    dest = `${dest}&state=${state}`;
  }
  return res.redirect(dest);
}

function ensureClientAllowsImplicitFlow(client) {
  ok(client.implicitFlow, 'Client is not allowed to use response_type "token"');
}

function redirectWithToken(res, client, user, auth) {
  throw new Error('not implemented');
}

function createAuthorization(client, user) {
  throw new Error('not implemented');
}

function authorize({ store, loginUrl }) {
  return (req, res, next) => {
    ensureValidAuthorizeRequest(req);
    const { redirect_uri, response_type, state } = req.query;
    store
      .getClientById(req.query.client_id)
      .then(client => {
        ok(client, 'Client does not exist');
        ensureValidClient(client);
        ok(isRedirectUriAllowed(client, redirect_uri), 'redirect_uri not allowed');
        return client;
      })
      .then(client => {
        if (req.session && req.session.user) {
          // is authenticated
          return store
            .getExistingUser()
            .then(user => Promise.all([user, createAuthorization(client, user)]))
            .then(([user, auth]) => {
              if (response_type === 'code') {
                return redirectWithCode(res, auth, redirect_uri, state);
              }
              // response_type === 'token'
              ensureClientAllowsImplicitFlow(client);
              return redirectWithToken(res, client, user, auth);
            });
        }
        // is not authenticated, must login
        req.session.urlAfterLogin = req.url; // TODO: keep here?
        return res.redirect(loginUrl);
      })
      .catch(err => next(err));
  };
}
module.exports = authorize;
