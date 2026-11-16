// Run: node tests/prompt_counter_test.js
const normalize=s=>s.normalize('NFC').replace(/\r\n?/g,'\n').trim();
const count=s=>Array.from(normalize(s)).length;
const cases=[['ASCII','hello 1',7],['Hindi','नमस्ते',6],['emoji','A😀B',3],['CRLF','a\r\nb',3],['NFC','e\u0301',1],['trim','  abc  ',3]];
let failed=0;
for(const [name,input,expected] of cases){const actual=count(input);const ok=actual===expected;console.log(`${ok?'PASS':'FAIL'} ${name}: expected ${expected}, got ${actual}`);if(!ok)failed++;}
if(failed)process.exit(1);
