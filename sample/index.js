const buildApp = require('./app');

const port = process.env.PORT || 3000;
buildApp({ store: {} })
  .listen(port)
  .on('listening', () => {
    global.console.log('listening on port', port);
  });
