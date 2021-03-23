# Oauth2 server.

## Installation

1. Run `npm install`.
2. Add values in .env file.

## Develop

1. Run `npm start`

## Bugs

address already in use :::3000
`lsof -wni tcp:3000`
`kill -9 {id}`

## For Oauth2:

1. Client takes configuration Oauth2 from get '/oauth2/.well-known/openid-configuration'

2. The user is redirected to authorization route (from configuration) - get '
   /oauth2/authorize?response_type=token&client_id={client_id}&state={state}&redirect_uri={redirect_uri}&scope={scope}'.

3. login.ensureLoggedIn() - the user sees get '/login'.
4. The user enters a creads and sends to post '/login'.
5. Used local authenticate strategy (email, password).
6. If there are no error - server.authorization
7. If the user requests the creads from current client for a first time, used 'dialog' for confirmation.
8. Created new token on 'oauth2orize.grant.token'
9. User is redirected on redirect_uri

## Angular 8 (angular-oauth2-oidc) config

```clientId: 'antropogenez-client-id'```

## Deploy

1. With pm2: `pm2 start index.js --name oauth2-server`.
2. For logs: `pm2 logs`.

Open http://ptitsynamv.1gb.ua/oauth2

## Deploy with Apache2

1. Install Apache in your server. Rename the file "example.oauth2-server.conf" to "oauth2-server.conf", edit it and add to "/etc/apache2/sites-available".
2. Allow Apache settings for backend application proxy:   
  - `a2enmod proxy`
  - `a2enmod proxy_http`
  - `a2enmod proxy_ajp`
  - `a2enmod proxy_balancer`
  - `a2enmod proxy_connect`
  - `a2enmod proxy_html`
3. Deactivate default file `a2dissite 000-default.conf`
4. Activate file `a2ensite oauth2-server.conf`.
5. Check config file `apache2ctl configtest`.
6. Apply apache2: `sudo a2enmod rewrite && sudo systemctl restart apache2`.
7. For logs `nano /var/log/apache2/error.log`.
