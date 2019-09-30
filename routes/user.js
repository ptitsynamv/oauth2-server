const passport = require('passport');
const express = require('express');
const router = express.Router();

const info = [
    passport.authenticate('bearer', {session: false}),
    (request, response) => {
        // request.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`. It is typically used to indicate scope of the token,
        // and used in access control checks. For illustrative purposes, this
        // example simply returns the scope in the response.
        response.json({_id: request.user.id, email: request.user.email});
    }
];
router.get('/userinfo', info);

module.exports = router;