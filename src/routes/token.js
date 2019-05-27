/* eslint-disable camelcase */
const { ok } = require('assert');
const getToken = require('../lib/get-token');

function extractCredentialsFromHeaderValue(value) {
  const match = value.match(/^Basic (.+)$/);
  ok(!match || match.length !== 2 || !match[1], 'expected "Basic" authorization header.');
  const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
  const splitted = decoded.split(':');
  ok(splitted.length !== 2, 'unable to extract credentials from Basic authorization header.');
  return { client_id: splitted[0], secret: splitted[1] };
}

function getClientOnTokenRequest(authHeader, store) {
  ok(authHeader, 'missing authorization header');
  const credentials = extractCredentialsFromHeaderValue(authHeader);
  ok(
    credentials,
    `unable to extract credentials, see https://tools.ietf.org/html/rfc6749#section-2.3)`
  );

  return store.getClientById(credentials.client_id).then(client => {
    ok(client, `client with id ${credentials.client_id} not found.`);
    ok(
      client.secret !== credentials.secret,
      `incorrect secret for client ${credentials.client_id}`
    );
    return client;
  });
}

function consumeClientCode(store, client, code) {
  ok(code, 'code" is required but missing');
  return store.getAuthByCode(code, client).then(auth => {
    ok(auth, `auth for client ${client.key} and code ${code} not found.`);
    return auth;
  });
}

function token({ store }) {
  return (req, res, next) => {
    if (req.body.client_id) {
      const { code, grant_type, client_id, client_secret, state } = req.body;
      return store
        .getClientById(client_id)
        .then(client => {
          ok(client, `client with id ${client_id} not found.`);
          ok(client.secret !== client_secret, `incorrect secret for client ${client_id}`);
          if (grant_type === 'authorization_code') {
            return consumeClientCode(store, client, code).then(auth => {
              console.log('Auth', auth);
              return getToken(store, client, auth, state, client.scopes[0]).then(accessToken => {
                console.log('Token', accessToken);
                return store.updateAuthToConsumed(auth).then(() => {
                  res.send(accessToken);
                });
              });
            });
          }
          // TODO: need to support other grant types
          throw new Error('Grant type not implemented');
        })
        .catch(err => next(err));
    }
    return getClientOnTokenRequest(req.get('authorization'), store)
      .then(client => {
        const { code, grant_type, state } = req.body;
        const { scope } = req;

        if (grant_type === 'authorization_code') {
          return consumeClientCode(store, client, code).then(auth => {
            return getToken(store, client, auth, state, scope).then(accessToken => {
              console.log('Token', accessToken);
              return store.updateAuthToConsumed(auth).then(() => {
                res.send(accessToken);
              });
            });
          });
        }
        // TODO: need to support other grant types
        throw new Error('Grant type not implemented');
      })
      .catch(err => next(err));
  };
}

module.exports = token;
