const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const routes = require('./routes');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');
const mongoose = require('mongoose');
const keys = require('./config');

const app = express();
mongoose.connect(keys.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => console.log('mongo db connected'))
    .catch(error => console.log(error));

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './public/views'));
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

require('./auth');

app.use('/', routes.site);
app.use('/', routes.test);
app.use('/oauth2', routes.oauth2);
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`server start on ${port}`));

