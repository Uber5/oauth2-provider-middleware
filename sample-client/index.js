const buildClient = require('./client');

// TODO: where do we get clientId and provider from?

const provider = process.env.PROVIDER;
const clientId = process.env.CLIENT_ID;

const port = process.env.PORT || 3000;
buildClient({ provider, clientId })
  .listen(port)
  .on('listening', () => {
    global.console.log('listening on port', port);
  });
