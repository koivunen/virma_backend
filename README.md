# Virma backend
This repository contains backend source code for Virma application. Application is hosted at https://virma.lounaistieto.fi.

# Getting started
Installation and running the backend are explained in more detail in the frontend repository.

```
1. npm install
2. npm start (or npm run start-dev)
3. By default running at http://localhost:8081
```

Run in production with "npm start". This runs the following script with prod configs and forever (server will run continuously). In order to use forever, it needs to be installed with the following command -> npm install forever -g

```
cross-env NODE_ENV=production forever start server/server.js
```

If you are developing run with "npm start-dev". It runs the backend with dev configs.

```
cross-env NODE_ENV=development node server/server.js
```

# Development
For development it is necessary to create config.js -file to the project root. In this file it is mandatroy to define prod and dev object that follow the following structure:

```
const prod = {
  username: <db-user>,
  password: <db-pass>,
  db: <db-name>,
  host: <db-host>,
  port: <db-port>,
  apiHost: <api-host>,
  senderEmail: <application-email>,
  directUrl: <application-direct-url>,
  sessionSecret: <sessionSecret>
}

const dev = {
  ...
}

const config = process.env.NODE_ENV === 'development' ? dev : prod;

module.exports = config;
```

# Repository structure

```
.
|-- db
|   |-- models               Contains sequelize models for db
|-- emailTemplates           EmailTemplates for sendmail
|-- server                   Server routes, scripts and services
|-- views                    Routing views
|-- package.json             Configure npm package & scripts
```

# License
Virma is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT)
