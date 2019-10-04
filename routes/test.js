const express = require('express');
const router = express.Router();
const request = require('request');

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

router.get('/test', test);
router.get('/test/authorization-code', testAuthorizationCode);


module.exports = router;