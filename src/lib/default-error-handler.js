const debug = require('debug')('oauth2-provider-middleware:authorize');
const { AssertionError } = require('assert');

module.exports = (err, req, res, next) => {
  if (err instanceof AssertionError) {
    debug('ERR (Assertion)', err);
    res.status(400);
    return res.send({
      error: 'invalid_request',
      error_description: err.message,
      state: req.query.state
    });
  }
  debug('ERR (passthrough)', err);
  // all other errors are not handled here. By default,
  // they will result in a 500 error
  return next(err);
};
