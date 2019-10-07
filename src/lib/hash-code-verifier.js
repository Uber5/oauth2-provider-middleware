const sha256 = require('js-sha256');

module.exports = codeVerifier => {
  function base64URLEncode(str) {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  const hashed = sha256(codeVerifier);
  const bufferHash = Buffer.from(hashed, 'hex');
  const encoded = base64URLEncode(bufferHash);
  return encoded;
};
