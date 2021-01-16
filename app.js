var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var FormData = require('form-data');
const fileUpload = require('express-fileupload');

const db = require('./config/db.js');

var indexRouter = require('./routes/index')(db);
var usersRouter = require('./routes/users')(db);
var ApiRouter = require('./routes/api')(db);

var app = express();
var moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.moment = require('moment');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: "Shh, its a secret!",
  // resave: true,
  // saveUninitialized: true
}));

app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/index', ApiRouter);

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
