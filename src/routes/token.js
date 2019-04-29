/* eslint-disable camelcase */
const { ok } = require('assert');
const redirectWithToken = require('../lib/redirect-with-token');

function extractCredentialsFromHeaderValue(value) {
  const match = value.match(/^Basic (.+)$/);
  ok(!match || match.length !== 2 || !match[1], 'expected "Basic" authorization header.');
  const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
  const splitted = decoded.split(':');
  ok(splitted.length !== 2, 'unable to extract credentials from Basic authorization header.');
  return { client_id: splitted[0], secret: splitted[1] };
}

function getClientOnTokenRequest(store) {
  return (req, next) => {
    const authHeader = req.get('authorization');
    ok(authHeader, 'missing authorization header');
    const credentials = extractCredentialsFromHeaderValue(authHeader);
    ok(
      credentials,
      `unable to extract credentials, see https://tools.ietf.org/html/rfc6749#section-2.3)`
    );

    return store
      .getClientById(credentials.client_id)
      .then(client => {
        ok(client, `client with id ${credentials.client_id} not found.`);
        ok(
          client.secret !== credentials.secret,
          `incorrect secret for client ${credentials.client_id}`
        );
        return client;
      })
      .then(client => {
        req.client = client;
        next();
      })
      .catch(err => next(err));
  };
}

function consumeClientCode(store, client, code) {
  return req => {
    ok(code, 'code" is required but missing');
    return store.getAuthByCode(code, client).then(auth => {
      ok(auth, `auth for client ${client.key} and code ${code} not found.`);
      req.auth = auth;
      return store.updateAuthToConsumed(client);
    });
  };
}

function token({ store }) {
  return (req, res, next) => {
    return getClientOnTokenRequest(store)
      .then(() => {
        const { code, grant_type, redirect_uri } = req.body;
        const { client, scope, auth } = req;
        if (grant_type === 'authorization_code') {
          return consumeClientCode(store, client, code).then(() => {
            return redirectWithToken(store, res, client, auth, redirect_uri, scope);
          });
        }
        // TODO: need to support other grant types
        throw new Error('Grant type not implemented');
      })
      .catch(err => next(err));
  };
}

module.exports = token;
