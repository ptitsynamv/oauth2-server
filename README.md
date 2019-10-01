# Oauth2 server.

## used MondoDB on mlab.com.

### bugs
address already in use :::3000
`lsof -wni tcp:3000`
`kill -9 {id}`

### Для Oauth2:
1. Клиент забирает configuration Oauth2 из
get '/oauth2/.well-known/openid-configuration'

2. Редирект на роут авторизации (из configuration) - get '/oauth2/authorize?response_type=token&client_id={client_id}&state={state}&redirect_uri={redirect_uri}&scope={scope}'.
 
3. login.ensureLoggedIn() - пользователь видит get '/login'.
4. Вводит креды и отправляет на post '/login'.
5. Используем local authenticate strategy (email, password). 
6. Если все верно - server.authorization
7. Если пользователь первый раз запрашивает креды через данного клиента, используем 'dialog' для подтверждения.
8. Формируем новый токен на 'oauth2orize.grant.token'
9. Редикерт на redirect_uri

### Angular 8 (angular-oauth2-oidc) config
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