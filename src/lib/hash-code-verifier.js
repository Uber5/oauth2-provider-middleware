const base64url = require('base64url');
const sha256 = require('js-sha256');

module.exports = codeVerifier => {
  let asciiCode = '';
  codeVerifier.split('').forEach(char => {
    asciiCode += char.charCodeAt(0);
  });
  return base64url(sha256(asciiCode));
};
