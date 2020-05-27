# Oauth2 server.

## Used MondoDB on mlab.com.

## Bugs
address already in use :::3000
`lsof -wni tcp:3000`
`kill -9 {id}`

## For Oauth2:
1. Client takes configuration Oauth2 from
get '/oauth2/.well-known/openid-configuration'

2. The user is redirected to authorization route (from configuration) - get '/oauth2/authorize?response_type=token&client_id={client_id}&state={state}&redirect_uri={redirect_uri}&scope={scope}'.
 
3. login.ensureLoggedIn() - the user sees get '/login'.
4. The user enters a creads and sends to post '/login'.
5. Used local authenticate strategy (email, password). 
6. If there are no error - server.authorization
7. If the user requests the creads from current client for a first time, used 'dialog' for confirmation.
8. Created new token on 'oauth2orize.grant.token'
9. User is redirected on redirect_uri

## Angular 8 (angular-oauth2-oidc) config
```
    const authConfig: AuthConfig = {
        redirectUri: window.location.origin + '/articles',
        clientId: 'antropogenez-client-id',
        showDebugInformation: true,
        timeoutFactor: 0.8,
        requireHttps: false,
        issuer: environment.auth2Url + '/oauth2',
        oidc: false,
      };
```
```
    oauthService.configure(authConfig);
    oauthService.setupAutomaticSilentRefresh();
    oauthService.tokenValidationHandler = new JwksValidationHandler();
    oauthService.loadDiscoveryDocument();
```
## Docker
1. run `yarn docker:build`
2. run `yarn docker:run`
See your project on http://localhost:8001/
3. run `yarn docker:push` to push your image to Docker Hub

