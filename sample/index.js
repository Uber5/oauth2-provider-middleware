/* eslint-disable import/no-extraneous-dependencies */

const express = require('express');
const mware = require('../src');

const app = express();
const authRouter = mware.buildRouter({ express, store: {} });

app.use(authRouter);
app.get('/login', (req, res, next) => res.send('login form here...'));

const port = process.env.PORT || 3000;
app.listen(port).on('listening', () => {
  console.log('listening on port', port);
});
