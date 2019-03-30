/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable function-paren-newline */

const app = require('../sample/app');

const tryToListenOnPort = port =>
  new Promise(res =>
    app
      .listen(port)
      .on('error', res)
      .on('listening', () => res(true))
  );

async function runSampleServer() {
  let port = 2999;
  /* eslint-disable-next-line no-await-in-loop, no-plusplus, no-empty */
  while (!(await tryToListenOnPort(++port))) {}
  return port;
}

module.exports = {
  runSampleServer
};
