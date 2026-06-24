# Auth.md

Agent authentication and registration metadata for JS.Gripe.

JS.Gripe is a public, read-only personal site. Public pages, Markdown mirrors, `llms.txt`, and discovery metadata do not require agent registration or OAuth credentials.

## Agent Registration

Registration endpoint: https://www.js.gripe/auth.md

Registration required: no

Supported identity types:

- anonymous

Credential types:

- none

Agents may access public resources without creating an account, presenting a token, or completing an out-of-band registration step.

## Standalone Registration Flow

1. Read this Auth.md document.
2. Use the `public:read` scope for public pages, Markdown mirrors, SEO files, and discovery metadata.
3. Do not request credentials. This site does not issue client IDs, secrets, API keys, bearer tokens, or signed agent credentials for public access.
4. Follow the linked discovery metadata below when a client requires machine-readable authentication metadata.

## Authentication

This site does not currently expose protected APIs. Agents should treat `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` as informational metadata that declares the public read scope and no OAuth credential grant flow.

Protected resource metadata: https://www.js.gripe/.well-known/oauth-protected-resource

Authorization server metadata: https://www.js.gripe/.well-known/oauth-authorization-server

Agent auth metadata: https://www.js.gripe/.well-known/oauth-authorization-server#agent_auth

Scopes supported:

- `public:read`: read public pages, Markdown mirrors, SEO files, and discovery metadata.

## Claims

No claims are required for public access.

Claims endpoint: https://www.js.gripe/auth.md#claims

## Revocation

No revocation action is required because JS.Gripe does not issue credentials for public access.

Revocation endpoint: https://www.js.gripe/auth.md#revocation

## Contact

Use the public repository for site-level issues: https://github.com/jsw-teams/myweb
