# UMESH PRAKASH SINGH DIGITAL AI DIRECTOR — Functional Starter

Open `index.html` through an HTTPS static host (for example, GitHub Pages) or a local HTTP server. The app loads `config/master_audited.json` and provides a local project dashboard, brand profiles, prompt editor/counter, asset metadata register, exports, workspace backup/import and local QC.

## Important boundaries
- Projects and asset metadata are stored in the current browser's localStorage. They do not automatically sync between devices.
- Selecting a file registers its name/type/size metadata only; the file bytes are not uploaded or backed up.
- Video prompts are limited to 900 Unicode code points after NFC and line-ending normalization.
- Gemini, image/video generation, VFX/BFX rendering, audio/lip-sync, publishing and Supabase cloud sync are not connected.
- Never place provider API keys or Supabase service-role keys in browser JavaScript.
- Read `docs/README_HI.md` and `docs/RELEASE_GAPS.md` before deployment.
