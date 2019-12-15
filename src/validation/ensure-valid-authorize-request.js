/* eslint-disable camelcase */
const { ok } = require('assert');

const responseTypes = ['token', 'code'];

module.exports = req => {
  const {
    client_id,
    redirect_uri,
    response_type,
    state,
    scope, // is optional
    code_challenge,
    code_challenge_method,
    ...otherParams
  } = req.query;
  ok(client_id, 'client_id is required but missing');
  ok(redirect_uri, 'redirect_uri is required but missing');
  ok(
    response_type && responseTypes.includes(response_type),
    `response_type invalid, must be one of: ${responseTypes.join(', ')}`
  );
  ok(state || !state); // TODO: is optional?
  ok(Object.keys(otherParams).length === 0, 'Contains superfluous query parameters');
};
