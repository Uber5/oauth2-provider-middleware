const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port).on('listening', () => {
  global.console.log('listening on port', port);
});
