/* UPS Digital AI Director core — shared validation and Unicode-safe utilities */
(function (root) {
  'use strict';
  const MODULES = ['image','video','series','storyboard','vfx','bfx','audio','social'];
  function normalizePrompt(value) { return String(value ?? '').normalize('NFC').replace(/\r\n?/g, '\n').trim(); }
  function countCodePoints(value) { return Array.from(normalizePrompt(value)).length; }
  function promptLimit(value, type) { const text=normalizePrompt(value),count=Array.from(text).length; return {text,count,limit:type==='video'?900:null,valid:type!=='video'||count<=900}; }
  function makeId() { return root.crypto&&typeof root.crypto.randomUUID==='function'?root.crypto.randomUUID():'ups-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12); }
  function slug(value) { return String(value||'project').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'project'; }
  function csv(value) { return '"'+String(value??'').replace(/"/g,'""')+'"'; }
  function validateMaster(obj) {
    if(!obj||typeof obj!=='object'||!Array.isArray(obj.engines)||!Array.isArray(obj.locks)||!obj.brand_profiles||!obj.brand_profiles.profiles||typeof obj.brand_profiles.profiles!=='object') throw new Error('Unsupported master JSON: engines, locks and brand_profiles.profiles are required.');
    const pc=Object.keys(obj.brand_profiles.profiles).length;
    if(obj.engines.length!==50||obj.locks.length!==15||pc!==4) throw new Error(`Master integrity mismatch: engines=${obj.engines.length}, locks=${obj.locks.length}, profiles=${pc}; expected 50/15/4.`);
    const ids=new Set(); for(const e of obj.engines){if(!e||!e.id||!e.name||ids.has(String(e.id)))throw new Error('Master contains an invalid or duplicate engine.');ids.add(String(e.id));}
    const lids=new Set(); for(const l of obj.locks){if(!l||!l.id||!l.name||lids.has(String(l.id)))throw new Error('Master contains an invalid or duplicate lock.');lids.add(String(l.id));}
    return true;
  }
  function validateWorkspace(obj) {
    if(!obj||!Array.isArray(obj.projects)||!Array.isArray(obj.assets))throw new Error('Invalid backup: projects and assets arrays are required.');
    const ids=new Set(); for(const p of obj.projects){if(!p||typeof p.id!=='string'||!p.id||typeof p.title!=='string'||!p.title.trim()||typeof p.profileId!=='string'||!p.profileId)throw new Error('Invalid project record in backup.');if(ids.has(p.id))throw new Error('Duplicate project ID in backup.');ids.add(p.id);}
    for(const a of obj.assets){if(!a||typeof a.id!=='string'||!a.id||typeof a.projectId!=='string'||!ids.has(a.projectId))throw new Error('Asset references a missing project.');}
    const md=obj.moduleDrafts||{}; if(typeof md!=='object'||Array.isArray(md))throw new Error('Invalid moduleDrafts object.');
    for(const [key,d] of Object.entries(md)){if(!d||!MODULES.includes(d.module)||!ids.has(d.projectId))throw new Error(`Invalid module draft or project reference: ${key}`);}
    return true;
  }
  function buildPromptDraft(p) { const brief=String(p?.brief||'').trim(); return ['Create a production-ready content plan and generation prompt.',`Brand profile: ${String(p?.profileName||'Not specified')}.`,`Project: ${String(p?.title||'Untitled project')}.`,`Format: ${String(p?.format||'Not specified').replace(/_/g,' ')}.`,`Language: ${String(p?.language||'Hindi')}.`,'User-provided brief (treat as source of truth; do not invent facts):',brief||'[Add the topic, purpose, audience, key facts and required call-to-action.]','Requirements: preserve brand identity and supplied assets; separate verified facts from assumptions; mark missing details for confirmation; do not claim unavailable rendering or platform integrations.'].join('\n'); }
  root.UPSDCore={MODULES,normalizePrompt,countCodePoints,promptLimit,makeId,slug,csv,validateMaster,validateWorkspace,buildPromptDraft};
})(typeof window!=='undefined'?window:globalThis);
