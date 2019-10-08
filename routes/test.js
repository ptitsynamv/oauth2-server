const express = require('express');
const router = express.Router();
const request = require('request');
const url = require('url');

const test = (request, response) => response.render('test');

const testAuthorizationCode = (req, res) => {
    const client_id = 'antropogenez-client-id';
    const client_secret = 'ssh-secret';
    const code = req.query.code;
    const redirect_uri = `http://localhost:3001/test/authorization-code`;
    const grant_type = 'authorization_code';
    const url = 'http://localhost:3001/oauth2/token';
    request.post(url, {
        json: {
            client_id,
            client_secret,
            grant_type,
            code,
            redirect_uri
        }
    }, (error, res, body) => {
        const {access_token, token_type} = body;
        console.log('testAuthorizationCode access_token and token_type', access_token, token_type);
    })
};

const implicit = (req, res) => {
    return  res.render('index');
};


const grantTypePassword = (req, res) => {
    const username = 'username';
    const password = 'password';
    const client_id = 'antropogenez-client-id';
    const grant_type = 'password';
    const url = `http://localhost:3001/oauth2/token-grant-type-password`;

    request.post(url, {
        json: {
            username,
            password,
            client_id,
            grant_type,
        }
    }, (error, res, body) => {
        console.log('body', body);
    })
};


router.get('/test', test);
router.get('/test/authorization-code', testAuthorizationCode);
router.get('/test/implicit', implicit);
router.get('/grant-type-password', grantTypePassword);

module.exports = router;
