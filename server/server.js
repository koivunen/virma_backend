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
const app = express();

const port = 8081;

// Api routes for data CRUD calls
const api = require('./api');

// Database services
const dbService = require('./services/dbService.js');

// Prevent simple security leaks and enable cors
app.use(helmet());

// Enable cors headers
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'http://valonia.westeurope.cloudapp.azure.com',
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
app.use(cookieParser('jhk1241ggas'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// Session handling
app.use(session({
  secret: 'f83jd29xdzs3851',
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
