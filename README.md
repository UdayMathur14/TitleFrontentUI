# TitleFlow UI

Premium Angular 22 standalone frontend for title operations.

## Features

- Responsive sidebar and operations dashboard
- Searchable, filterable and selectable title library
- Excel import, validation preview and commit workflow
- Template and filtered export actions
- API-only data flow; no hardcoded business records

## Run

```bash
npm install
npm start
```

The app expects the API at `https://localhost:7184/api`. Change `src/environments/environment.ts` when needed.

## Authorization hand-off

UMS opens TitleFlow with its token and application id:

```text
http://<title-ui>/?data=<ums-token>&appId=<application-id>
```

Before rendering the first route, TitleFlow calls
`POST http://192.168.29.101:100/api/v1/auth/fetch-internal-permissions` with
`{ "appId": "..." }` and the UMS Bearer token. It stores the returned profile
under `localStorage.profile`:

```json
{
  "accessToken": "<application JWT>",
  "permissions": ["Title_Validation_Invoice_Overview_VIEW"]
}
```

TitleFlow uses `permissions` for sidebar and route visibility and sends
`accessToken` only to the configured Title API. The API independently validates
the JWT signature, issuer, lifetime and `Permission` claims.
