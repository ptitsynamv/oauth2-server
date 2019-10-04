const oauth2orize = require('oauth2orize');
const passport = require('passport');
const login = require('connect-ensure-login');
const utils = require('../utilities');
const express = require('express');
const keys = require('../config');
const router = express.Router();
const models = require('../models');

const server = oauth2orize.createServer();

// Register serialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
    models.client.findById(id, (error, client) => {
        if (error) return done(error);
        return done(null, client);
    });
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources. It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes. The callback takes the `client` requesting
// authorization, the `redirectUri` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = utils.getUid(16);
    new models.authorizationCode({
        code,
        clientId: client.id,
        redirectUri,
        userId: user.id,
        userEmail: user.email,
    })
        .save((error) => {
            if (error) return done(error);
            return done(null, code);
        });
}));

// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
    const token = utils.getUid(256);
    models.accessToken.findOne(
        {clientId: client.clientId, userId: user.id},
        (error, accessToken) => {
            if (error) return done(error);
            if (!accessToken) {
                new models.accessToken({
                    token,
                    userId: user.id,
                    clientId: client.clientId,
                }).save((error) => {
                    if (error) return done(error);
                });
            } else {
                accessToken.token = token;
                accessToken.save((error) => {
                    if (error) return done(error);
                });
            }
            return done(null, token, {expires_in: keys.security.tokenLife, state: keys.security.state});
        });
}));

// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code. The issued access token response can include a refresh token and
// custom parameters by adding these to the `done()` call

server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
    models.authorizationCode.findOne({code}, (error, authCode) => {
        if (error) return done(error);
        if (client.id !== authCode.clientId) return done(null, false);
        if (redirectUri !== authCode.redirectUri) return done(null, false);

        const token = utils.getUid(256);
        new models.accessToken({
            token,
            userId: authCode.userId,
            clientId: authCode.clientId,
        })
            .save((error) => {
                if (error) return done(error);
                // Add custom params, e.g. the username
                // let params = {username: authCode.userName};
                // Call `done(err, accessToken, [refreshToken], [params])` to issue an access token
                return done(null, token);
            });
    });
}));

// Exchange user id and password for access tokens. The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    console.log(4);

    // Validate the client
    db.clients.findByClientId(client.clientId, (error, localClient) => {
        if (error) return done(error);
        if (!localClient) return done(null, false);
        if (localClient.clientSecret !== client.clientSecret) return done(null, false);
        // Validate the user
        db.users.findByUsername(username, (error, user) => {
            if (error) return done(error);
            if (!user) return done(null, false);
            if (password !== user.password) return done(null, false);
            // Everything validated, return the token
            const token = utils.getUid(256);
            db.accessTokens.save(token, user.id, client.clientId, (error) => {

                if (error) return done(error);
                // Call `done(err, accessToken, [refreshToken], [params])`, see oauth2orize.exchange.code
                return done(null, token);
            });
        });
    });
}));

// Exchange the client id and password/secret for an access token. The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {

    console.log(5);

    // Validate the client
    db.clients.findByClientId(client.clientId, (error, localClient) => {
        if (error) return done(error);
        if (!localClient) return done(null, false);
        if (localClient.clientSecret !== client.clientSecret) return done(null, false);
        // Everything validated, return the token
        const token = utils.getUid(256);
        // Pass in a null for user id since there is no user with this grant type
        db.accessTokens.save(token, null, client.clientId, (error) => {
            if (error) return done(error);
            // Call `done(err, accessToken, [refreshToken], [params])`, see oauth2orize.exchange.code
            return done(null, token);
        });
    });
}));


// User authorization endpoint.
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request. In
// doing so, is recommended that the `redirectUri` be checked against a
// registered value, although security requirements may vary across
// implementations. Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectUri` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction. It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization). We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.

const authorization = [
    login.ensureLoggedIn(),
    server.authorization((clientId, redirectUri, done) => {
        models.client.findOne({clientId}, (error, client) => {
            if (error) return done(error);
            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectUri provided by the client matches one registered with
            //          the server. For simplicity, this example does not. You have
            //          been warned.
            return done(null, client, redirectUri);
        });
    }, (client, user, done) => {
        // Check if grant request qualifies for immediate approval

        // Auto-approve
        if (client.isTrusted) return done(null, true);
        models.accessToken.findOne({userId: user.id, clientId: client.clientId}, (error, token) => {
            // Auto-approve
            if (token) return done(null, true);

            // Otherwise ask user
            return done(null, false);
        });
    }),
    (request, response) => {
        response.render('dialog', {
            transactionId: request.oauth2.transactionID,
            user: request.user,
            client: request.oauth2.client
        });
    },
];

// User decision endpoint.
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application. Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

const decision = [
    login.ensureLoggedIn(),
    server.decision(),
];


// Token endpoint.
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens. Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request. Clients must
// authenticate when making requests to this endpoint.

const token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {session: false}),
    server.token(),
    server.errorHandler(),
];

const expect = {
    "discoveryDocument": {
        "issuer": "http://localhost:3001/oauth2",
        "jwks_uri": "http://localhost:3001/oauth2/.well-known/jwks",
        "authorization_endpoint": "http://localhost:3001/oauth2/authorize",
        "token_endpoint": "http://localhost:3001/oauth2/token",
        "userinfo_endpoint": "http://localhost:3001/oauth2/userinfo",
        // "end_session_endpoint": "http://localhost:3001/oauth2/identity/connect/endsession",
        // "check_session_iframe": "http://localhost:3001/oauth2/identity/connect/checksession",
        // "revocation_endpoint": "http://localhost:3001/oauth2/identity/connect/revocation",
        "scopes_supported": ["api"],
        // "claims_supported": ["role", "projects", "buyInBulk", "sub", "name", "family_name", "given_name", "middle_name", "nickname", "preferred_username", "profile", "picture", "website", "gender", "birthdate", "zoneinfo", "locale", "updated_at", "email", "email_verified", "phone_number", "phone_number_verified", "address"],
        "response_types_supported": ["token", "id_token"],
        // "response_modes_supported": ["form_post", "query", "fragment"],
        // "grant_types_supported": ["authorization_code", "client_credentials", "password", "refresh_token", "implicit"],
        // "subject_types_supported": ["public"],
        // "id_token_signing_alg_values_supported": ["RS256"],
        // "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic"]
    },
    "jwks": {
        "keys": [{
            "kty": "RSA",
            "use": "sig",
            "kid": "KGAhprLdiAK1kRTo3K24SIF59E4",
            "x5t": "KGAhprLdiAK1kRTo3K24SIF59E4",
            "e": "AQAB",
            "n": "mock-n",
            "x5c": ["mock-x5c"]
        }]
    }
};

const configuration = [
    (request, response) => response.json(expect.discoveryDocument),
];

const jwks = [
    (request, response) => response.json({}),
];

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

router.get('/authorize', authorization);
router.post('/authorize/decision', decision);
router.post('/token', token);
router.get('/.well-known/openid-configuration', configuration);
router.get('/.well-known/jwks', jwks);
router.get('/userinfo', info);

module.exports = router;