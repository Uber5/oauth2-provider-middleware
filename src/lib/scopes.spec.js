const { ensureRequestedScopesArePermitted } = require('./scopes');

describe('ensureRequestedScopesArePermitted', () => {
  it('allows empty scope', () => {
    expect(ensureRequestedScopesArePermitted({ scopes: [] }, '')).toBeFalsy();
    expect(ensureRequestedScopesArePermitted({ scopes: [] }, undefined)).toBeFalsy();
  });
  it('accepts valid scope(s)', () => {
    const client = { scopes: ['x', 'y'] };
    expect(ensureRequestedScopesArePermitted(client, '')).toBeFalsy();
    expect(ensureRequestedScopesArePermitted(client, 'x')).toBeFalsy();
    expect(ensureRequestedScopesArePermitted(client, 'y')).toBeFalsy();
    expect(ensureRequestedScopesArePermitted(client, 'x y')).toBeFalsy();
  });
  it('throws on scope not permitted', () => {
    expect(() => ensureRequestedScopesArePermitted({ scopes: [] }, 'x')).toThrow();
    expect(() => ensureRequestedScopesArePermitted({ scopes: ['y'] }, 'x')).toThrow();
    expect(() => ensureRequestedScopesArePermitted({ scopes: ['x', 'y'] }, 'x z')).toThrow();
  });
});
