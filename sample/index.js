/* eslint-disable import/no-extraneous-dependencies */
const mongodb = require('mongodb');
const buildApp = require('./app');
const buildMongoStore = require('../src/store/build-mongo-store');

const uri = process.env.MONGO_URL || 'mongodb://localhost/oauth2-provider-middleware-sample';

const store = buildMongoStore({ uri, mongodb });

const port = process.env.PORT || 3000;
buildApp({ store })
  .listen(port)
  .on('listening', () => {
    global.console.log('listening on port', port);
  });
