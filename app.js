// Init App
var express = require('express')
var path = require('path');
var http = require('http').Server(app);
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var favicon = require('serve-favicon');

//Login Stuff
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var randomstring = require('randomstring');


//Mongodb
var mongo = require('mongodb');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');

//MongoDB Setup

mongoose.connect("mongodb://stellay:stellay@ds155080.mlab.com:55080/heroku_wrnw9d91");

var db = mongoose.connection;


var app = express()
app.listen(3000, function () {
  console.log('Listening on port 3000!')
})

// Connect Flash
app.use(flash());

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', 'hbs');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'), 
      root    = namespace.shift(), 
      formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
