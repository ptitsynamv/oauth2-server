const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const express = require('express');
const router = express.Router();

const index = (request, response) => response.send('OAuth 2.0 Server');

const loginForm = (request, response) => response.render('login');

const login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

const logout = (request, response) => {
  request.logout();
  response.redirect('/');
};

const account = [
    connectEnsureLogin.ensureLoggedIn(),
  (request, response) => response.render('account', { user: request.user }),
];


router.get('/', index);
router.get('/login', loginForm);
router.post('/login', login);
router.get('/logout', logout);
router.get('/account', account);

module.exports = router;