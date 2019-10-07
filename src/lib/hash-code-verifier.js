const sha256 = require('js-sha256');

module.exports = codeVerifier => {
  let asciiCode = '';
  codeVerifier.split('').forEach(char => {
    asciiCode = `${asciiCode + char.charCodeAt(0)} `;
  });
  const hashed = sha256(asciiCode);

  // eslint-disable-next-line no-buffer-constructor
  const encoded = new Buffer(hashed, 'utf-8').toString('base64');
  return encoded;
};
