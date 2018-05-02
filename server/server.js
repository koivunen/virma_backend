const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const config = require('../config.js');
const api = require('./api');
const dbService = require('./services/dbService.js');

const app = express();

const port = 8081;

app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : config.directUrl,
  methods: ['GET', 'POST'],
  allowHeaders: ['Origin, Content-Type, Accept, Authorization, Cache'],
  exposedHeaders: ['X-Requested-With'],
  credentials: true,
}));

// Template rendering
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Utils (post body parsing, cmd logging)
app.use(morgan(':remote-addr - [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
app.use(cookieParser(config.sessionSecret));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// Session handling
app.use(session({
  secret: config.sessionSecret,
  cookie: { maxAge: 3600000 }, // 1 hour cookie
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Server api routes
app.use('/api', api);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Apply db services
dbService.initDbCleanup();
dbService.scheduleLoginCleanup();

module.exports = app;
