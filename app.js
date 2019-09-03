var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var http = require('http');

var globalRouter = require('./routes/global');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var logger = require('./routes/winston');
var multer = require('multer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'client')));
app.set('view engine', 'ejs');
app.use('/bootstrap', express.static('bootstrap'));
app.use('/public', express.static('public'));
app.use('/vendor', express.static('vendor'));
app.use('/scss', express.static('scss'));

app.use(morgan('dev'));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/global', globalRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const _ = require('lodash');
const checkMode = "development";
// var Request = require("request");

// Request.get("https://api.wemaste.com/v1/env", (error, response, body) => {

//     if(error) {
//         return console.dir(error);
//     }
//     console.dir(JSON.parse(body));

//     // checkM

// ode=response;
// });

const config = require('./config/config.json');
const defaultConfig = config.development;
const envMode = config.env.mode;

if (envMode == "production") {
  logger.log({
    level: 'info',
    message: 'Production Environments started successfully',
    timestamp:new Date(),
  });
  process.env.NODE_ENV = 'production';
} else if (envMode == "testing") {
  process.env.NODE_ENV = 'testing';
  logger.log({
    level: 'info',
    message: 'Testing Environments started successfully',
    timestamp:new Date(),
  });
}
else {
  logger.log({
    level: 'info',
    message: 'Development Environments started successfully',
    timestamp:new Date(),
  });
  process.env.NODE_ENV = 'development';
}

const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

global.gConfig = finalConfig;

// log global.gConfig
// console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);

// app.listen(global.gConfig.node_port, () => {
//   logger.log({
//     level: 'info',
//     message: 'listening on port '+global.gConfig.node_port,
//     timestamp:new Date(),
//   });
//   console.log(`${global.gConfig.app_name} Adminwebapp started successfully & listening on port ${global.gConfig.node_port}`);
// });

const PORT = global.gConfig.node_port;

morgan.token('port', (req) => {
 console.log("in morgon")
  return req.app.locals.port;
});

// const app = express();
app.locals.port = PORT;

app.use(morgan(':method :url :port'));

app.get('/app', function(req, res) {
 res.send("Adminwebapp from server");
});

app.listen(PORT,() =>{
 console.log(`${global.gConfig.app_name} webapp started successfully & listening on port ${global.gConfig.node_port}`);
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.redirect('/');
});

module.exports = app;
