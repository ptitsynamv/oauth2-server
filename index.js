// const mongoose = require('mongoose');
const keys = require('./config/keys');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');

const app = express();
// mongoose.connect(keys.mongoUrl, {useNewUrlParser: true})
//     .then(() => console.log('mongo db connected'))
//     .catch(error => console.log(error));

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

require('./auth');
app.get('/', routes.site.index);
app.get('/login', routes.site.loginForm);
app.post('/login', routes.site.login);
app.get('/logout', routes.site.logout);
app.get('/account', routes.site.account);

app.get('/dialog/authorize', routes.oauth2.authorization);
app.post('/dialog/authorize/decision', routes.oauth2.decision);
app.post('/oauth/token', routes.oauth2.token);

app.get('/api/userinfo', routes.user.info);
app.get('/api/clientinfo', routes.client.info);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server start on ${port}`));