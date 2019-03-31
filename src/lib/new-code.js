const { randomBytes } = require('crypto');

module.exports = (numBytes = 16) => randomBytes(numBytes).toString('hex');
