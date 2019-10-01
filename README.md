# server 

MondoDB on mlab.com.


address already in use :::3000
`lsof -wni tcp:3000`
`kill -9 {id}`

Для Oauth2:
1. Клиент забирает configuration из
get '/oauth2/.well-known/openid-configuration'

Роут для авторизации get '/oauth2/authorize'. 
Пользователь видит get '/login'.
Вводит креды и отправляет на post '/login'.
Использует local authenticate strategy. 







const authConfig: AuthConfig = {
  redirectUri: window.location.origin + '/articles',
  clientId: 'abc123',
  responseType: 'token',
  scope: 'api',
  showDebugInformation: true,
  oidc: false,
  requireHttps: false,
  issuer: 'http://localhost:3001',
  loginUrl: 'http://localhost:3001/oauth2/authorize',
};

// get http://localhost:3001/oauth2/authorize
// post http://localhost:3001/oauth2/authorize/decision
// post http://localhost:3001/oauth2/token
//
// get http://localhost:3001
// get post http://localhost:3001/login
// get http://localhost:3001/logout
// get http://localhost:3001/account
//
// get http://localhost:3001/user/userinfo
