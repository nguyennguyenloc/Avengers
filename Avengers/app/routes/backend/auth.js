var express = require('express');
var router  = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


const usersModel     = require(__path_models + 'users');
const systemConfig   = require(__path_config + 'system');
const notify         = require(__path_config + 'notify');
const folderView     = __path_views_admin + 'pages/auth/';
const layoutLogin    = __path_views_admin + 'login';

const linkIndex      = '/' + systemConfig.prefixAdmin + '/dashboard/';
const linkLogin      = '/' + systemConfig.prefixAdmin + '/auth/login';
const validatorLogin = require(__path_validates + 'login');
/* GET logout page. */
router.get('/logout', function(req, res, next) {
	req.logout();
	res.redirect(linkLogin);
});

//Get login page
router.get('/login', function(req, res, next){
    if(req.isAuthenticated()) res.redirect(linkIndex);

    let item = {email: '', 'password': ''};
    let errors = null;
    res.render(`${folderView}login`, {layout: layoutLogin, errors, item});
});

/* GET dashboard list */
router.get('/no-permission', function (req, res, next) {
    res.render(`${folderView}no-permission`, { pageTitle: 'No Permission'});
});

//Post login page
router.post('/login', function(req, res, next){
    if(req.isAuthenticated()) res.redirect(linkIndex);

    req.body = JSON.parse(JSON.stringify(req.body));
    validatorLogin.validator(req);

    let item = Object.assign(req.body);
    let errors = req.validationErrors();
    if(errors){
        res.render(`${folderView}login`, {layout: layoutLogin, item, errors});
    }else{
        passport.authenticate('local', { 
            successRedirect: linkIndex, 
            failureRedirect: linkLogin,
            failureFlash: true  
        })(req, res, next);
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        usersModel.getItemByUsername(username, null).then((users) => {
            let user = users[0];
            if(!user){
                return done(null, false, {message: notify.ERROR_LOGIN});

            }else{
                if(password !== user.password){
                    return done(null, false, {message: notify.ERROR_LOGIN});
                }else{
                    // console.log("ok");
                    return done(null, user);
                }
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    usersModel.getItems(id, null).then((user) =>{
        done(null, user);
    })
});

module.exports = router;
