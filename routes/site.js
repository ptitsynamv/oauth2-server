const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const express = require('express');
const router = express.Router();
const models = require('../models');
const bcrypt = require('bcryptjs');

const index = (request, response) => response.render('index');

const loginForm = (request, response) => response.render('login', {message: ''});

const registerUserForm = (request, response) => response.render('register-user', {message: ''});

const registerClientForm = (request, response) => response.render('register-client', {message: ''});

const login = passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect: '/login'});

const registerUser = async (request, response) => {
    const {email, password} = request.body;
    const candidate = await models.user.findOne({email});

    if (candidate) {
        return response.render('register-user', {
            message: 'user is exist'
        })
    }
    const salt = bcrypt.genSaltSync(10);
    const user = new models.user({
        email,
        password: bcrypt.hashSync(password, salt)
    });
    try {
        await user.save();
        return response.render('account', {name: user.email})
    } catch (error) {
        return response.render('register-user', {
            message: error,
        })
    }
};

const registerClient = async (request, response) => {
    const {name, clientId, clientSecret} = request.body;
    const candidate = await models.client.findOne({name});

    if (candidate) {
        return response.render('register-client', {
            message: 'client is exist'
        })
    }
    const client = new models.client({name, clientId, clientSecret});
    try {
        await client.save();
        return response.render('account', {name: client.name})
    } catch (error) {
        return response.render('register-client', {
            message: error,
        })
    }
};

const logout = (request, response) => {
    request.logout();
    response.redirect('/');
};

const account = [
    connectEnsureLogin.ensureLoggedIn(),
    (request, response) => {
        const user = request.user;
        return response.render('account', {name: user.email});
    },
];

const info = async (request, response) => {
    const clients = await models.client.find({}).select('name clientId clientSecret isTrusted').exec();
    const users = await models.user.find({}).select('email').exec();
    return response.render('info', {clients, users});
};

router.get('/', index);
router.get('/login', loginForm);
router.post('/login', login);
router.get('/logout', logout);
router.get('/register-user', registerUserForm);
router.post('/register-user', registerUser);
router.get('/register-client', registerClientForm);
router.post('/register-client', registerClient);
router.get('/account', account);
router.get('/info', info);

module.exports = router;