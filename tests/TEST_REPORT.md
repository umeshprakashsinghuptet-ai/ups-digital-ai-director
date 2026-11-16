# Technical Test Report — Final Functional Starter

## Automated checks executed in the package build
- Master JSON parsed and validated: exactly 50 engines, 15 locks, four profiles.
- JavaScript syntax: `node --check app/core.js`, `node --check app/app.js`, `node --check tests/*.js`.
- Core tests: Unicode NFC, CRLF normalization, emoji code-point counting, 900/901 video prompt boundary, master integrity and workspace import validation.
- HTML-to-JavaScript element ID references checked.
- Package manifest file sizes and SHA-256 hashes regenerated.
- Secret scan: no API key or service-role key values are included.
- SQL reviewed for RLS owner scoping, audit append-only policy, project updated_at trigger and least-privilege grants.

## Browser / external acceptance not performed
No live Android Chrome or desktop browser automation, Supabase project, Gemini API, media generation provider, VFX renderer, audio/lip-sync provider, or real publishing account was connected. These remain NOT TESTED, not PASS.

## Manual acceptance checklist
- [ ] Open GitHub Pages HTTPS deployment and check console for errors.
- [ ] Create a project under each of the four profiles.
- [ ] Save prompt, reload page and verify local persistence.
- [ ] Verify 900 code points accepted and 901 rejected for video prompts.
- [ ] Verify Hindi, combining marks, emoji and CRLF counting.
- [ ] Test clipboard permission and TXT/JSON/CSV downloads.
- [ ] Export/import workspace JSON and compare project/asset metadata.
- [ ] Test mobile and desktop breakpoints.
- [ ] Apply SQL to a disposable Supabase staging project.
- [ ] With two test accounts, verify user A cannot read or modify user B's projects/assets/audit events.
- [ ] Verify audit events cannot be updated/deleted by client roles.
- [ ] Configure private Storage policies separately and run a backup/restore drill.

## Release decision
STATIC PACKAGE CHECKS: PASS.
LOCAL STARTER FUNCTIONALITY: IMPLEMENTED; BROWSER ACCEPTANCE PENDING.
END-TO-END / PRODUCTION RELEASE: NOT CERTIFIED.
