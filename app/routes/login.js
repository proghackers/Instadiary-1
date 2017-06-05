var request = require('request');
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/user/login');
}

module.exports = function(app, passport) {

    // PROFILE SECTION =========================
    app.get('/user/profile', isLoggedIn, function(req, res) {
        request('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + req.user.instagram.token, function(error, response, body) {
            var imgs = [];
            if (error) {
                console.log(error);
            }
            console.log(response);
            console.log(Date() + body);
            var instaValue = JSON.parse(body);
            for (var i = 0; i < instaValue.data.length; i++) {
                var ele = instaValue.data[i];
                imgs.push(ele.images.standard_resolution.url);
            }
            res.render('userprofile', {
                images: imgs
            });
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // instagram -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/instagram', passport.authenticate('instagram'));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/instagram/callback',
        passport.authenticate('instagram', {
            successRedirect: '/insta/user/profile',
            failureRedirect: '/insta/'
        }));
};