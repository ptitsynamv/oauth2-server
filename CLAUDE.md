# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A small OAuth2 authorization server built on Express + `oauth2orize` + Passport, with MongoDB (Mongoose 5) for storage and EJS views for the login/consent/registration pages. It is plain CommonJS Node.js — no TypeScript, no build step, no linter, and no test suite. (The global Angular rules in the user's config do not apply to this repo.)

## Commands

- `npm install` — install dependencies
- `npm start` — run with nodemon (auto-restart)
- `npm run server` — run with plain `node index`

Configuration comes from `.env` (see [.env.example](.env.example)): `MONGO_URL`, `PORT`, `DEPLOY_URL`, `TOKEN_LIFE`, `SECURITY_STATE`, `ADMIN_EMAIL`, `FRONTEND_OAUTH2_PROJECT_URL`. `DEPLOY_URL` must end with a trailing slash — URLs are built as `${DEPLOY_URL}oauth2/token` etc.

Manual verification is done through the `/test` page ([routes/test.js](routes/test.js)), which exercises the authorization-code, password, and client-credentials grants against the running server. It hardcodes the client `antropogenez-client-id` / `ssh-secret` and a test user, so those must exist in the database.

## Deployment

**Every push to `master` deploys to production** via [.github/workflows/deploy.yml](.github/workflows/deploy.yml): files are SFTP'd to `/var/projects/oauth2-server` (excluding `.env` and `node_modules`), then `npm install` and a pm2 restart (`oauth2-server`) run over SSH. Apache reverse-proxies `/oauth2` to the app ([example.oauth2-server.conf](example.oauth2-server.conf)).

## Architecture

- [index.js](index.js) wires everything: Mongo connection, session (in-memory store), Passport, then mounts routers — `site` and `test` at `/`, `oauth2` at `/oauth2`. Requiring [auth/index.js](auth/index.js) registers all Passport strategies as a side effect.
- [auth/index.js](auth/index.js) — Passport strategies:
  - `local` (email + bcrypt password) for the browser login session;
  - `basic` and `oauth2-client-password` (shared `verifyClient`) plus `oauth2-resource-owner-password` to authenticate clients at the token endpoint;
  - `bearer` for protected resources — it rejects tokens with no `userId`, so client-credentials tokens cannot call `/userinfo` or `/user-role`.
- [routes/oauth2.js](routes/oauth2.js) — the `oauth2orize` server: grants (`code`, `token`/implicit), exchanges (`code`, `password`, `clientCredentials`), and endpoints `/authorize`, `/authorize/decision`, `/token`, `/.well-known/openid-configuration`, `/.well-known/jwks`, `/userinfo`, `/user-role`.
  - Authorization flow: `ensureLoggedIn()` redirects to `/login` → `server.authorization` looks up the client → immediate approval if `client.isTrusted` or the user already has a token for that client, otherwise renders `dialog.ejs` which posts to `/authorize/decision`.
  - The discovery document is a static object built from `DEPLOY_URL`; `/.well-known/jwks` returns `{}`. Tokens are opaque random strings from `utils.getUid` stored in Mongo, not JWTs.
  - The implicit grant keeps one token per (client, user) and overwrites it; the other exchanges insert a new token document each time.
  - `redirectUri` is not validated against the client registration.
  - `/user-role` returns `admin` if the token's user email equals `ADMIN_EMAIL`, else `guest`.
- [routes/site.js](routes/site.js) — login/logout, account, and unauthenticated user/client registration forms; `/info` lists all clients (including secrets) and users.
- [models/](models/) — Mongoose models exported from [models/index.js](models/index.js) as `user`, `client`, `accessToken`, `authorizationCode`. Note the inconsistent client identifier: authorization codes store the Mongo `client.id`, while access tokens store the public `client.clientId`.
- [public/views/](public/views/) — EJS templates (shared `includes/header.ejs` / `footer.ejs`).

Code style: Mongoose callback APIs in auth/oauth2 code, `async/await` in [routes/site.js](routes/site.js); 4-space indentation, single quotes.
