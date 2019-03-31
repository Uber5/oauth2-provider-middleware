/* eslint-disable camelcase */
const { ok } = require('assert');
const ensureValidAuthorizeRequest = require('../validation/ensure-valid-authorize-request');
const ensureValidClient = require('../validation/ensure-valid-client');
const isRedirectUriAllowed = require('../lib/is-redirect-uri-allowed');

function authorize({ store, loginUrl }) {
  return (req, res, next) => {
    ensureValidAuthorizeRequest(req);
    const { redirect_uri } = req.query;
    store
      .getClientById(req.query.client_id)
      .then(client => {
        ok(client, 'Client does not exist');
        ensureValidClient(client);
        ok(isRedirectUriAllowed(client, redirect_uri), 'redirect_uri not allowed');
        return client;
      })
      .then(client => {
        res.end(`Should authorize, client_id=${req.query.client_id}`);
        next();
      })
      .catch(err => next(err));
  };
}
module.exports = authorize;
