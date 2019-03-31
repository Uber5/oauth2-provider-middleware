/* eslint-disable camelcase */
const { ok } = require('assert');
const StoreError = require('../lib/store-error');

module.exports = client => {
  try {
    const { client_id, redirect_uris } = client;
    ok(client_id, 'client_id is required but missing');
    ok(redirect_uris, 'redirect_uris is required but missing');
    // TODO: incomplete
  } catch (e) {
    throw new StoreError(e.message);
  }
};
