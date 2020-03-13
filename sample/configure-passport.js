/* eslint-disable func-names */
/* eslint-disable import/no-extraneous-dependencies */
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

function isValidPasswordFn(password, hashed) {
  return bcrypt.compareSync(password, hashed);
}

function configurePassport(passport, store) {
  passport.use(
    new LocalStrategy(function(username, password, done) {
      store.getUserByName(username).then(user => {
        if (!user || !isValidPasswordFn(password, user.password)) {
          return done(null, false, { message: 'Invalid login credentials.' });
        }
        return done(null, user);
      });
    })
  );

  passport.serializeUser(function(user, done) {
    /* eslint-disable-next-line no-underscore-dangle */
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    store
      .getUserById(id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(new Error('User not found'), null);
      })
      .catch(err => done(err, null));
  });
}
module.exports = configurePassport;
