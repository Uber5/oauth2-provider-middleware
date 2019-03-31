const { ok } = require('assert');
const defaultErrorHandler = require('./lib/default-error-handler');
const ensureValidAuthorizeRequest = require('./validation/ensure-valid-authorize-request');

function buildRouter({ express, store, errorHandler }) {
  ok(express && store);
  const router = express.Router();
  router.get('/authorize', (req, res, next) => {
    ensureValidAuthorizeRequest(req);
    res.end(`Should authorize, client_id=${req.query.client_id}`);
    next();
  });

  // TODO: remove, as unnecessary
  router.get('/login', (req, res, next) => {
    global.console.log('login... but we just call next...');
    next();
  });

  router.use(errorHandler || defaultErrorHandler);
  return router;
}

module.exports = buildRouter;
