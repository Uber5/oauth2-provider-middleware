const buildCodeClient = require('./client');

// TODO: where do we get clientId and provider from?

const provider = process.env.PROVIDER;
const client = process.env.CLIENT_ID;

const port = process.env.PORT || 3000;
buildCodeClient({ provider, client })
  .listen(port)
  .on('listening', () => {
    global.console.log('listening on port', port);
  });
