/* eslint-disable camelcase */
const debug = require('debug')('oauth2-provider-middleware:authorize');
const { ok } = require('assert');
const ensureValidAuthorizeRequest = require('../validation/ensure-valid-authorize-request');
const ensureValidClient = require('../validation/ensure-valid-client');
const ensureValidAccessToken = require('../validation/ensure-valid-access-token');
const isRedirectUriAllowed = require('../lib/is-redirect-uri-allowed');
const createAuthorization = require('../lib/create-authorization');
const { ensureRequestedScopesArePermitted, getScopeForResponse } = require('../lib/scopes');

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

const encodeFragmentData = data =>
  Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');

function redirectWithToken(store, res, client, user, auth, state, redirectUri) {
  return store.newAccessToken({ auth, client, user }).then(token => {
    ensureValidAccessToken(token);
    const redirectData = {
      access_token: token.token,
      token_type: 'token',
      expires_in: Math.floor(
        (new Date(token.expiresAt).getTime() - new Date(token.updatedAt)) / 1000
      ),
      state,
      scope: getScopeForResponse(client, auth.scope)
    };
    const url = `${redirectUri}${uriFragmentSeparator(redirectUri)}${encodeFragmentData(
      redirectData
    )}`;
    return res.redirect(url);
  });
}

function authorize({ store, loginUrl }) {
  return (req, res, next) => {
    ensureValidAuthorizeRequest(req);
    const { redirect_uri, response_type, state, scope } = req.query;
    store
      .getClientById(req.query.client_id)
      .then(client => {
        ok(client, 'Client does not exist');
        ensureValidClient(client);
        ensureRequestedScopesArePermitted(client, scope);
        ok(isRedirectUriAllowed(client, redirect_uri), 'redirect_uri not allowed');
        return client;
      })
      .then(client => {
        if (req.user) {
          // is authenticated
          return Promise.all([req.user, createAuthorization(store, client, req.user, scope)]).then(
            ([user, auth]) => {
              if (response_type === 'code') {
                return redirectWithCode(res, auth, redirect_uri, state);
              }
              // response_type === 'token'
              ensureClientAllowsImplicitFlow(client);
              return redirectWithToken(store, res, client, user, auth, state, redirect_uri);
            }
          );
        }
        // is not authenticated, must login
        req.session.urlAfterLogin = req.url; // TODO: keep here?
        return res.redirect(loginUrl);
      })
      .catch(err => {
        debug('ERR on /authorize', err);
        next(err);
      });
  };
}
module.exports = authorize;
