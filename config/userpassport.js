// load all the things we need
var InstagramStrategy = require('passport-instagram').Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new InstagramStrategy({

            clientID: configAuth.instagramAuth.clientID,
            clientSecret: configAuth.instagramAuth.clientSecret,
            callbackURL: configAuth.instagramAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {

                //console.log(Date() + 'Request', req);
                // check if the user is already logged in
                console.log(Date() + 'Insta Profile', profile);
                if (!req.user) {

                    User.findOne({ 'instagram.id': profile.id }, function(err, user) {
                        if (err) {
                            return done(err);
                        }

                        if (user) {

                            console.log(user);

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.instagram.token) {
                                user.instagram.token = token;
                                user.name = profile.displayName;

                                user.save(function(err) {
                                    if (err) {
                                        return done(err);
                                    }

                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();
                            newUser.instagram.id = profile.id;
                            newUser.instagram.token = token;
                            newUser.name = profile.displayName;

                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.instagram.id = profile.id;
                    user.instagram.token = token;
                    user.name = profile.displayName;

                    user.save(function(err) {
                        if (err) {
                            return done(err);
                        }
                        console.log(Date() + 'New user created', user);
                        return done(null, user);
                    });

                }
            });

        }));
}