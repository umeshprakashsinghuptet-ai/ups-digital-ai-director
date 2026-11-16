# Release Gap Register

| Area | Package status | Remaining evidence/action |
|---|---|---|
| Master JSON integrity | Included; source bytes preserved | Re-run hash after future edits |
| Dashboard/forms/navigation | Implemented in HTML/CSS/JS | Live browser acceptance required |
| Local project persistence | localStorage | Test reload, quota, private mode and browser-data deletion |
| Prompt counter | NFC + CRLF normalization + Unicode code-point count | Compare with target generator's exact counting rules |
| Copy/download/export | TXT, project JSON, asset CSV, workspace JSON | Test real browsers and download permissions |
| Workspace import | Validates project and asset references | Test backup/restore on target devices |
| Asset library | Metadata register only | Binary files are not uploaded or backed up |
| Supabase SQL | Starter schema, RLS, updated_at trigger, append-only audit policy | Apply to staging; test two-user isolation; configure private Storage separately |
| Gemini/provider adapter | Not implemented/connected | Server-side adapter, secret manager and provider tests |
| YT Create | Manual workflow only | User operates external app and checks rendered media |
| Image/video/VFX/BFX rendering | Not implemented | Integrate a real renderer/provider and inspect output |
| Audio/lip-sync | Not implemented | Integrate provider and test Hindi timing/export |
| ZIP export inside app | Not implemented | The delivered ZIP is the complete source package; in-app ZIP export requires a ZIP library or server-side packager |
| Android/Desktop acceptance | Not run | Run checklist in tests/TEST_REPORT.md |
| Production security | Not certified | HTTPS, CSP, dependency pinning, server-side secrets, monitoring, backups and restore drill |
