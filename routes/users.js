var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator())
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var randomstring = require('randomstring');

var User = require('../models/user');

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

// Register
router.get('/register', function(req, res){	
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});


// Register User
router.post('/register', function(req, res){
	var username = req.body.kerberos;
	var password = req.body.password;

	// Validation
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();


    User.findOne({ 'username' :  username }, function(err, user) {
    // if there are any errors, return the error
		if(err) {
      console.log(err)
			throw err;
    }

    // check to see if theres already a user with that username
        if (user) {
            console.log("LOL")
            req.flash('error_msg', 'That username is already taken');
            res.redirect('/users/register');
        } 

			else {
				var newUser = new User({
					username: username,
					password: password,
				});

				User.createUser(newUser, function(err, user){
					if(err) throw err;
					console.log(user);
				});

				req.flash('success_msg', 'You are registered and can now login');
				res.redirect('/users/login');
			}
    });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      console.log("no user")
      return done(null, false, {message: 'Unknown user'});
    }

    console.log(user)

    User.comparePassword(password, user.password, function(err, isMatch){
      console.log("YAY")
      if(err) throw err;
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Invalid password'});
      }
    });
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

/*
router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/index', 
  		failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    console.log("Uhhh posted")
    res.redirect('/');
  });
*/

router.post('/login', 
  passport.authenticate('local', { successRedirect: '/users/index', failureRedirect: '/users/login' })
);

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

router.get('/index', ensureAuthenticated, function(req, res){
  res.render('index', { user: req.user });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;