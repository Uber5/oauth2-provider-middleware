/* eslint-disable camelcase */
const { ok, AssertionError } = require('assert');

const responseTypes = ['token', 'code'];

const defaultErrorHandler = (err, req, res, next) => {
  if (err instanceof AssertionError) {
    res.status(400);
    return res.send({
      error: 'invalid_request',
      error_description: err.message,
      state: req.query.state
    });
  }
  return next(err);
};

const ensureValidAuthorizeRequest = req => {
  const { client_id, redirect_uri, response_type, state, ...otherParams } = req.query;
  ok(client_id, 'client_id is required but missing');
  ok(redirect_uri, 'redirect_uri is required but missing');
  ok(
    response_type && responseTypes.includes(response_type),
    `Invalid response_type, must be one of: ${responseTypes.join(', ')}`
  );
  ok(state || !state); // TODO: is optional?
  ok(Object.keys(otherParams).length === 0, 'Contains superfluous query parameters');
};

function buildRouter({ express, store, errorHandler }) {
  ok(express && store);
  const router = express.Router();
  router.get('/authorize', (req, res, next) => {
    ensureValidAuthorizeRequest(req);
    res.end(`Should authorize, client_id=${req.query.client_id}`);
    next();
  });
  router.get('/login', (req, res, next) => {
    global.console.log('login... but we just call next...');
    next();
  });

  router.use(errorHandler || defaultErrorHandler);
  return router;
}

module.exports = buildRouter;
