/* eslint-disable camelcase */
const { ok } = require('assert');
const getToken = require('../lib/get-token');
const hashCodeVerifier = require('../lib/hash-code-verifier');

function extractCredentialsFromHeaderValue(value) {
  const match = value.match(/^Basic (.+)$/);
  ok(!match || match.length !== 2 || !match[1], 'expected "Basic" authorization header.');
  const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
  const splitted = decoded.split(':');
  ok(splitted.length !== 2, 'unable to extract credentials from Basic authorization header.');
  return { client_id: splitted[0], secret: splitted[1] };
}

function getClientById(store, clientId, clientSecret) {
  return store.getClientById(clientId).then(client => {
    ok(client, `client with id ${clientId} not found.`);
    ok(client.secret !== clientSecret, `incorrect secret for client ${clientId}`);
    return client;
  });
}

function getClientOnTokenRequest(authHeader, store) {
  ok(authHeader, 'missing authorization header');
  const credentials = extractCredentialsFromHeaderValue(authHeader);
  ok(
    credentials,
    `unable to extract credentials, see https://tools.ietf.org/html/rfc6749#section-2.3)`
  );

  return getClientById(store, credentials.client_id, credentials.secret);
}

function exchangeCodeForToken(store, client, code, state, code_verifier) {
  ok(code, 'code" is required but missing');
  return store
    .getAuthByCode(code, client)
    .then(auth => {
      ok(auth, `auth for client ${client.client_id} and code ${code} not found.`);
      if (client.pkceFlow) {
        // code verification
        ok(code_verifier, 'code verifier is required');
        const hashedVarifier = hashCodeVerifier(code_verifier);
        if (auth.code_challenge !== hashedVarifier) {
          throw new Error('Code verifier does not match');
        }
      }
      return auth;
    })
    .then(auth => getToken(store, client, auth, state));
}

function token({ store }) {
  return (req, res, next) => {
    const { code, grant_type, state, client_id, client_secret, code_verifier } = req.body;
    const clientPromise = client_id
      ? getClientById(store, client_id, client_secret)
      : getClientOnTokenRequest(req.get('authorization'), store);

    return clientPromise
      .then(client => {
        if (grant_type === 'authorization_code') {
          return exchangeCodeForToken(store, client, code, state, code_verifier).then(
            accessToken => {
              res.send(accessToken);
            }
          );
        }
        // TODO: need to support other grant types
        throw new Error('Grant type not implemented');
      })
      .catch(err => next(err));
  };
}

module.exports = token;
