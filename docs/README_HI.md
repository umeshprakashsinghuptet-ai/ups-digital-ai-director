# UMESH PRAKASH SINGH — DIGITAL AI DIRECTOR
## Local Functional Starter Package

यह पैकेज audited master JSON के ऊपर एक वास्तविक शुरुआती browser application जोड़ता है। मूल master JSON को `config/master_audited.json` में बिना बदलाव रखा गया है।

## अभी क्या काम करता है
- Responsive dashboard और navigation.
- Master JSON load करना और 50 engines / 15 locks / 4 profiles की उपस्थिति दिखाना.
- चार brand profiles का अलग-अलग प्रदर्शन.
- Local project creation और browser localStorage में persistence.
- Video prompt के लिए NFC + newline normalization और 900 Unicode code-point ceiling.
- Copy prompt, prompt TXT download, project JSON, asset CSV और workspace JSON backup/import.
- Asset metadata registry और rights/consent note.
- Basic local QC checks.
- Supabase के लिए प्रारंभिक owner-scoped RLS SQL.

## अभी क्या connected नहीं है
- Gemini API या कोई भी paid/free generation provider.
- YT Create automation या social platform publishing.
- Supabase cloud sync / Auth UI / Storage bucket.
- वास्तविक image/video rendering, VFX/BFX render, voice generation, lip-sync.
- ZIP generation inside browser UI.
- Android Chrome और desktop पर user-device acceptance test.

UI में provider-connected या rendering-success का कोई झूठा दावा नहीं किया गया है।

## चलाने का तरीका
1. ZIP extract करें.
2. पूरा `ups_director_package` folder structure ज्यों का त्यों GitHub repository के root में upload करें. `app/`, `config/`, `sql/`, `docs/` और `tests/` folders को अलग-अलग जगह न ले जाएँ.
3. GitHub Pages में Deploy from branch चुनें और repository root (`/`) publish करें.
4. प्रकाशित site के root URL को खोलें. Root `index.html` अपने-आप `app/index.html` पर भेजेगा.
5. `app/index.html` से `../config/master_audited.json` load होगा. Master load न हो तो Settings में `config/master_audited.json` manually चुनें.
6. Project बनाएँ, prompt लिखें, Save करें और नियमित रूप से Workspace JSON backup export करें.

**ध्यान दें:** `file://` से खोलने पर browser security के कारण automatic master fetch रुक सकता है. HTTPS GitHub Pages या local HTTP server इस्तेमाल करें.

## GitHub Pages का सही folder layout
```
repository-root/
  index.html
  app/
    index.html
    app.js
    core.js
    styles.css
  config/
    master_audited.json
  sql/
  docs/
  tests/
  README.md
  PACKAGE_MANIFEST.json
```
पूरे package को इसी structure में deploy करें. Files को root में अलग-अलग move करने की जरूरत नहीं है.

## Supabase SQL
`sql/001_initial_schema.sql` को केवल नए/staging project में पहले review करके चलाएँ. यह SQL:
- Projects, assets, append-only audit events बनाता है.
- RLS enable करता है.
- केवल `auth.uid() = owner_id` पर access देता है.
- कोई super-admin role या client-side privileged bypass नहीं बनाता.

Production से पहले signup/signin/logout, cross-user access denial, project/asset ownership, Storage policies और backup/restore का परीक्षण जरूरी है.

## सुरक्षा
- API keys, passwords, service-role keys कभी HTML/JS, GitHub, JSON, localStorage या chat में न रखें.
- Provider API calls के लिए server-side function/backend और secret manager चाहिए.
- School/student imagery के लिए documented school + parent/guardian consent जरूरी है.
- Gyan Public School address master में conflicted है; पुष्टि से पहले प्रकाशित न करें.
- Product/course/fee/affiliation/stock/warranty claims बिना current official verification publish न करें.

## वर्तमान ईमानदार स्थिति
यह **functional local starter** है, production-ready SaaS नहीं. Local UI/code/export features उपलब्ध हैं; cloud, provider, rendering और device QA अभी pending हैं. `tests/TEST_REPORT.md` देखें.
