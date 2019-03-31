/* eslint-disable import/no-extraneous-dependencies */
const bcrypt = require('bcryptjs');

module.exports = plain => bcrypt.hashSync(plain);
