const express = require('express');
const router = express.Router();
const request = require('request');

const test = (request, response) => response.render('test', {
    frontendOauth2ProjectUrl: process.env.FRONTEND_OAUTH2_PROJECT_URL,
});

const testAuthorizationCode = (req, res) => {
    const client_id = 'antropogenez-client-id';
    const client_secret = 'ssh-secret';
    const code = req.query.code;
    console.log('')
    const redirect_uri = `${process.env.DEPLOY_URL}test/authorization-code`;
    const grant_type = 'authorization_code';
    const url = `${process.env.DEPLOY_URL}oauth2/token`;
    request.post(url, {
        json: {
            client_id,
            client_secret,
            grant_type,
            code,
            redirect_uri
        }
    }, (error, resp, body) => {
        const {access_token, token_type} = body;
        return res.render('test-result', {access_token, token_type});
    })
};

const implicit = (req, res) => {
    return res.render('index');
};


const grantTypePassword = (req, res) => {
    const username = 'ptitsynamv@gmail.com';
    const password = 'password';
    const client_id = 'antropogenez-client-id';
    const grant_type = 'password';
    const url = `${process.env.DEPLOY_URL}oauth2/token`;

    request.post(url, {
        json: {
            username,
            password,
            client_id,
            grant_type,
        }
    }, (error, resp, body) => {
        const {access_token, token_type} = body;
        return res.render('test-result', {access_token, token_type});
    })
};

const clientCredentials = (req, res) => {
    const client_id = 'antropogenez-client-id';
    const client_secret = 'ssh-secret';
    const grant_type = 'client_credentials';
    const url = `${process.env.DEPLOY_URL}oauth2/token`;

    request.post(url, {
        json: {
            client_id,
            client_secret,
            grant_type,
        }
    }, (error, resp, body) => {
        const {access_token, token_type} = body;
        return res.render('test-result', {access_token, token_type});
    })
};


router.get('/test', test);
router.get('/test/authorization-code', testAuthorizationCode);
router.get('/test/implicit', implicit);
router.get('/test/grant-type-password', grantTypePassword);
router.get('/test/client-credentials', clientCredentials);

module.exports = router;
