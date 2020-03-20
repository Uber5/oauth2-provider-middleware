const { ok } = require('assert');
const authorize = require('./routes/authorize');
const token = require('./routes/token');
const defaultErrorHandler = require('./lib/default-error-handler');

function buildRouter({ express, store, errorHandler, loginUrl }) {
  ok(express && store);
  const router = express.Router();
  router.get('/authorize', authorize({ store, loginUrl: loginUrl || '/login' }));

  // TODO: remove, as unnecessary
  router.get('/login', (req, res, next) => {
    next();
  });

  router.post('/token', token({ store }));

  router.use(errorHandler || defaultErrorHandler);
  return router;
}

module.exports = buildRouter;
