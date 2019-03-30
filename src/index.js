
function buildRouter({ express, store }) {
  const router = express.Router()
  router.get('/authorize', (req, res, next) => {
    res.end('should authorize')
    next()
  })
  router.get('/login', (req, res, next) => {
    console.log('login... but we just call next...')
    next()
  })
  return router
}

module.exports = {
  buildRouter
}