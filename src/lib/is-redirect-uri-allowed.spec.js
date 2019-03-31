/* eslint-disable no-restricted-syntax */
const isRedirectUriAllowed = require('./is-redirect-uri-allowed');

describe('is-redirect-uri-allowed', () => {
  it('is false for empty list of allowed uris', () => {
    expect(
      isRedirectUriAllowed(
        {
          redirect_uris: []
        },
        'bla'
      )
    ).toBe(false);
  });

  const cases = [
    { uris: ['blx', 'blax'], uriToTest: 'bla', result: false },
    { uris: ['blx', 'blax'], uriToTest: 'blax', result: true },
    { uris: ['http://bla'], uriToTest: 'http://bla1', result: true },
    { uris: ['http://bla'], uriToTest: 'https://bla', result: false }
  ];

  for (const c of cases) {
    it(`Given uris ${c.uris}, uri to test ${c.uriToTest}, it is ${c.result}`, () => {
      expect(
        isRedirectUriAllowed(
          {
            redirect_uris: c.uris
          },
          c.uriToTest
        )
      ).toBe(c.result);
    });
  }
});
