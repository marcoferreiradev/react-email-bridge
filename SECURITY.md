# Security Policy

## Supported versions

| Version | Status |
|---------|--------|
| `0.2.x` (current) | ✅ supported |
| `< 0.2` | ❌ unsupported (pre-publish builds, do not use) |

## Reporting a vulnerability

Please **do not open a public GitHub issue** for security reports.

Email **marcoferreiradev@gmail.com** with:

- A description of the vulnerability and its impact.
- A minimal reproduction (template, fixture, command).
- The affected version(s).
- Any suggested mitigation, if you have one.

You can expect:

- An acknowledgment within 5 business days.
- A confirmation (or rejection) of the report within 2 weeks.
- A coordinated fix in a patch release with credit to the reporter in the
  release notes (unless you'd prefer to stay anonymous).

## Scope

In-scope: vulnerabilities in `react-email-bridge`, `react-email-bridge-ui`,
their CLI commands, the preview server, or the bundled HBS helpers.

Out-of-scope: vulnerabilities in upstream dependencies (please report
those directly to the upstream maintainer); issues that require an
attacker to already have shell access to the user's machine.
