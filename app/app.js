'use strict';
const STORE='ups_director_workspace_v2';
const DEFAULT={projects:[],assets:[],master:null,theme:'light',moduleDrafts:{}};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=loadState();
function loadState(){
  try {
    const parsed=JSON.parse(localStorage.getItem(STORE)||'null');
    if(parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.assets)) return {...DEFAULT,...parsed,moduleDrafts:parsed.moduleDrafts&&typeof parsed.moduleDrafts==='object'?parsed.moduleDrafts:{}};
  } catch(err){ console.warn('Workspace state could not be read; starting empty.',err); }
  return {...DEFAULT};
}
function persist(){
  try { localStorage.setItem(STORE,JSON.stringify(state)); $('saveState').textContent='SAVED LOCALLY'; return true; }
  catch(err){ $('saveState').textContent='SAVE FAILED'; console.error(err); alert('Local storage में जगह या browser permission की समस्या है। Workspace backup export करें। बड़े media files इस app में store नहीं होते।'); return false; }
}
function download(name,content,type='application/json'){
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function profiles(){return state.master?.brand_profiles?.profiles||{};}
function findProject(id){return state.projects.find(p=>p.id===id);}
function activeProject(id){return findProject(id||$('promptProject')?.value||$('exportProject')?.value||$('assetProject')?.value);}
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
}
function fillProjectSelect(id){
  const el=$(id);if(!el)return;const old=el.value;
  el.innerHTML='<option value="">Select project</option>'+state.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');
  if(state.projects.some(p=>p.id===old))el.value=old;
}
function renderProfiles(){
  const box=$('profileCards'),ps=profiles();
  box.innerHTML=Object.entries(ps).map(([id,p])=>`<article class="profile-card"><h3>${esc(p.brand_name||id)}</h3><span class="tag">${esc(p.brand_type||'brand')}</span><span class="tag">${esc(p.status||'PENDING_VERIFICATION')}</span><p>${esc(p.verification?.note||'Profile facts require review before publication.')}</p><small class="muted">Profile ID: ${esc(id)}</small></article>`).join('')||'<div class="empty">Load the audited master JSON to view profiles.</div>';
}
function renderAssets(){
  const box=$('assetList');
  box.innerHTML=state.assets.length?state.assets.map(a=>`<div class="asset-row"><div><b>${esc(a.name)}</b><div class="muted">${esc(a.type)} · ${esc(a.projectTitle)} · ${esc(a.fileName||'Metadata only')} · ${esc(a.rights||'Rights note pending')}</div></div><button class="button ghost" data-delete-asset="${esc(a.id)}" type="button">Remove</button></div>`).join(''):'<div class="empty">No registered assets.</div>';
}
function render(){
  fillModuleProjectSelects();
  $('projectCount').textContent=state.projects.length;$('assetCount').textContent=state.assets.length;
  $('engineCount').textContent=state.master?.engines?.length??'—';$('lockCount').textContent=state.master?.locks?.length??'—';
  $('recentProjects').innerHTML=state.projects.length?state.projects.slice(-5).reverse().map(p=>`<div class="project-row"><div><b>${esc(p.title)}</b><div class="muted">${esc(p.profileName)} · ${esc(p.format)} · ${new Date(p.updatedAt).toLocaleDateString()}</div></div><button class="button ghost" data-open-project="${esc(p.id)}" type="button">Open</button><button class="button danger" data-delete-project="${esc(p.id)}" type="button">Delete</button></div>`).join(''):'<div class="empty">No projects yet. Create your first project.</div>';
  const profileSelect=$('projectProfile'),oldProfile=profileSelect.value;
  profileSelect.innerHTML='<option value="">Select brand profile</option>'+Object.entries(profiles()).map(([id,p])=>`<option value="${esc(id)}">${esc(p.brand_name||id)}</option>`).join('');
  if(Object.keys(profiles()).includes(oldProfile))profileSelect.value=oldProfile;
  ['promptProject','assetProject','exportProject'].forEach(fillProjectSelect);
  renderProfiles();renderAssets();
  $('masterStatus').textContent=state.master?`Master loaded: ${state.master.system_name||'Digital AI Director'} · ${state.master.engines.length} engines · ${state.master.locks.length} locks`:'Master JSON not loaded. Load config/master_audited.json.';
}
function fillModuleProjectSelects(){
  document.querySelectorAll('[data-linked-project]').forEach(el=>{const old=el.value;el.innerHTML='<option value="">Select a saved project</option>'+state.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');if(state.projects.some(p=>p.id===old))el.value=old;});
}
function moduleDraftKey(projectId,module){return `${projectId}::${module}`;}
function moduleFormData(form){const data={};new FormData(form).forEach((v,k)=>{if(typeof v==='string')data[k]=v;});return data;}
function restoreModuleForm(form){const module=form.dataset.moduleForm,projectId=form.elements.namedItem('projectId')?.value||'';if(!projectId)return;const item=state.moduleDrafts[moduleDraftKey(projectId,module)];if(!item)return;Object.entries(item.data||{}).forEach(([name,value])=>{const field=form.elements.namedItem(name);if(field&&field.type!=='file')field.value=value;});const status=form.querySelector('[data-module-status]');if(status)status.textContent='Draft restored from this project.';}
function saveModuleDraft(module){const form=document.querySelector(`[data-module-form="${module}"]`);if(!form)return;const data=moduleFormData(form),projectId=data.projectId||'';if(!findProject(projectId)){const s=form.querySelector('[data-module-status]');if(s)s.textContent='पहले project बनाइए और चुनिए।';return;}if(module==='video'&&UPSDCore.countCodePoints(data.brief||'')>900){const s=form.querySelector('[data-module-status]');if(s)s.textContent='Video prompt 900 characters से अधिक है।';return;}state.moduleDrafts[moduleDraftKey(projectId,module)]={module,projectId,data,updatedAt:new Date().toISOString()};persist();const s=form.querySelector('[data-module-status]');if(s)s.textContent='Saved to this project locally.';}
function exportModuleDraft(module){const form=document.querySelector(`[data-module-form="${module}"]`);if(!form)return;const data=moduleFormData(form);download(`ups-${module}-draft.json`,JSON.stringify({module,projectId:data.projectId||'',data,exportedAt:new Date().toISOString()},null,2));}
function bindModules(){
 document.querySelectorAll('[data-module-form]').forEach(form=>{const sel=form.elements.namedItem('projectId');if(sel){sel.addEventListener('change',()=>{form.querySelectorAll('input:not([type=file]),textarea').forEach(x=>{if(x.name!=='projectId')x.value='';});form.querySelectorAll('select').forEach(x=>{if(x.name!=='projectId')x.selectedIndex=0;});restoreModuleForm(form);});} });
 document.addEventListener('click',e=>{const s=e.target.closest('[data-module-save]');if(s){e.preventDefault();saveModuleDraft(s.dataset.moduleSave);return;}const x=e.target.closest('[data-module-export]');if(x){e.preventDefault();exportModuleDraft(x.dataset.moduleExport);}});
 document.querySelectorAll('[data-video-counter]').forEach(el=>el.addEventListener('input',()=>{const out=el.closest('label')?.querySelector('[data-video-count]');if(out)out.textContent=UPSDCore.countCodePoints(el.value)+' / 900 characters';}));
}
function promptCount(){
  const result=UPSDCore.promptLimit($('promptText').value,$('promptType').value);
  $('charCount').textContent=result.limit?`${result.count} / ${result.limit} characters`:`${result.count} characters`;
  $('charCount').parentElement.classList.toggle('over',!result.valid);
  $('promptStatus').textContent=!result.valid?'LIMIT EXCEEDED':(result.count?'Within limit':'Ready');
  $('savePrompt').disabled=!result.valid||!result.text;
  return result;
}
function loadProjectPrompt(id){
  const p=findProject(id);$('promptText').value=p?.prompt||'';$('promptType').value=p?.promptType||'video';promptCount();
}
function projectPayload(p){return {...p,assets:state.assets.filter(a=>a.projectId===p.id),exportedAt:new Date().toISOString()};}
function runQC(){
  const r=[],add=(name,pass,detail)=>r.push({name,pass,detail});
  const ps=profiles();
  add('Master configuration loaded',!!state.master,'Load config/master_audited.json in Settings.');
  add('Exactly 50 engines',state.master?.engines?.length===50,`Found ${state.master?.engines?.length??0}; expected 50.`);
  add('Exactly 15 locks',state.master?.locks?.length===15,`Found ${state.master?.locks?.length??0}; expected 15.`);
  add('Four brand profiles',Object.keys(ps).length===4,`Found ${Object.keys(ps).length}; expected 4.`);
  add('Project profile references valid',state.projects.every(p=>!!ps[p.profileId]),'Each project must reference a known profile.');
  add('Project titles complete',state.projects.every(p=>String(p.title||'').trim().length>0),'All saved projects need a title.');
  add('Project briefs complete',state.projects.every(p=>String(p.brief||'').trim().length>0),'Empty briefs are flagged; this is a content readiness check.');
  add('Asset project references valid',state.assets.every(a=>state.projects.some(p=>p.id===a.projectId)),'Every asset metadata record must reference an existing project.');
  add('Asset rights notes',state.assets.every(a=>String(a.rights||'').trim().length>0),'Record ownership/consent status before use.');
  add('Eight creator modules present',UPSDCore.MODULES.every(k=>!!document.querySelector(`[data-module-form=\"${k}\"]`)),'Image, Video, Series, Storyboard, VFX, BFX, Audio and Social forms.');
  add('Module drafts reference valid projects',Object.values(state.moduleDrafts||{}).every(d=>d&&state.projects.some(p=>p.id===d.projectId)),'Every saved module draft must reference an existing project.');
  add('Video prompt limit',state.projects.every(p=>p.promptType!=='video'||UPSDCore.countCodePoints(p.prompt||'')<=900),'Saved video prompts must not exceed 900 Unicode code points.');
  add('No client-side API secrets',true,'This package contains no provider secret values.');
  add('External provider integration',false,'Gemini/media providers are not connected or live-tested.');
  add('Cloud database integration',false,'Supabase has not been configured or live-tested.');
  add('Real device/browser acceptance',false,'Requires actual Android Chrome and desktop browser testing.');
  $('qcResults').innerHTML=r.map(x=>`<div class="asset-row"><div><b>${esc(x.name)}</b><div class="muted">${esc(x.detail)}</div></div><b class="${x.pass?'good':'warn'}">${x.pass?'PASS':'PENDING / FAIL'}</b></div>`).join('')+`<p><b>${r.filter(x=>x.pass).length}/${r.length} local checks passed.</b> Pending integrations are not counted as passed. This is not end-to-end release certification.</p>`;
}
function loadMaster(obj){UPSDCore.validateMaster(obj);state.master=obj;if(persist())render();}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
$('projectForm').addEventListener('submit',e=>{
  e.preventDefault();
  const profileId=$('projectProfile').value,profile=profiles()[profileId];
  const p={id:UPSDCore.makeId(),title:$('projectTitle').value.trim(),profileId,profileName:profile?.brand_name||profileId,format:$('projectFormat').value,language:$('projectLanguage').value,brief:$('projectBrief').value.trim(),prompt:'',promptType:'video',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  if(!p.title||!profileId){$('projectFeedback').textContent='Project title and profile are required.';return;}
  state.projects.push(p);if(!persist()){state.projects.pop();return;}
  render();$('projectFeedback').textContent='Project saved locally.';$('projectForm').reset();showView('prompt');$('promptProject').value=p.id;loadProjectPrompt(p.id);
});
$('promptProject').addEventListener('change',()=>loadProjectPrompt($('promptProject').value));
$('promptText').addEventListener('input',promptCount);$('promptType').addEventListener('change',promptCount);
$('savePrompt').addEventListener('click',()=>{
  const p=activeProject($('promptProject').value),v=promptCount();
  if(!p||!v.valid||!v.text){$('promptStatus').textContent='Select a project and enter a valid prompt.';return;}
  p.prompt=v.text;p.promptType=$('promptType').value;p.updatedAt=new Date().toISOString();
  if(persist())$('promptStatus').textContent='Prompt saved to project.';
});
$('copyPrompt').addEventListener('click',async()=>{
  const v=promptCount();if(!v.valid||!v.text)return;
  try{await navigator.clipboard.writeText(v.text);$('promptStatus').textContent='Copied.';}
  catch{$('promptStatus').textContent='Clipboard permission unavailable; select and copy manually.';}
});
$('downloadPrompt').addEventListener('click',()=>{const v=promptCount();if(v.valid&&v.text)download('prompt.txt',v.text,'text/plain;charset=utf-8');});
$('assetForm').addEventListener('submit',e=>{
  e.preventDefault();const p=findProject($('assetProject').value),f=$('assetFile').files[0];
  if(!p){alert('पहले project बनाइए।');return;}
  const a={id:UPSDCore.makeId(),projectId:p.id,projectTitle:p.title,profileId:p.profileId,name:$('assetName').value.trim(),type:$('assetType').value,fileName:f?.name||'',fileSize:f?.size||0,mimeType:f?.type||'',rights:$('assetRights').value.trim(),registeredAt:new Date().toISOString()};
  state.assets.push(a);if(!persist()){state.assets.pop();return;}render();$('assetForm').reset();
});
$('assetList').addEventListener('click',e=>{
  const b=e.target.closest('[data-delete-asset]');if(!b)return;
  state.assets=state.assets.filter(a=>a.id!==b.dataset.deleteAsset);persist();render();
});
$('recentProjects').addEventListener('click',e=>{
  const open=e.target.closest('[data-open-project]');if(open){showView('prompt');$('promptProject').value=open.dataset.openProject;loadProjectPrompt(open.dataset.openProject);return;}
  const del=e.target.closest('[data-delete-project]');
  if(del&&confirm('Delete this project and its registered asset metadata?')){state.projects=state.projects.filter(p=>p.id!==del.dataset.deleteProject);state.assets=state.assets.filter(a=>a.projectId!==del.dataset.deleteProject);persist();render();}
});
$('exportProjectJson').addEventListener('click',()=>{const p=findProject($('exportProject').value);if(p)download(`${UPSDCore.slug(p.title)}.json`,JSON.stringify(projectPayload(p),null,2));else alert('Select a project first.');});
$('exportPromptTxt').addEventListener('click',()=>{const p=findProject($('exportProject').value);if(p?.prompt)download(`${UPSDCore.slug(p.title)}-prompt.txt`,p.prompt,'text/plain;charset=utf-8');else alert('इस project में saved prompt नहीं है।');});
$('exportAssetCsv').addEventListener('click',()=>{
  const p=findProject($('exportProject').value);if(!p){alert('Select a project first.');return;}
  const rows=[['asset_id','name','type','file_name','file_size','mime_type','rights_note','registered_at'],...state.assets.filter(a=>a.projectId===p.id).map(a=>[a.id,a.name,a.type,a.fileName,a.fileSize,a.mimeType,a.rights,a.registeredAt])];
  download(`${UPSDCore.slug(p.title)}-assets.csv`,rows.map(row=>row.map(UPSDCore.csv).join(',')).join('\r\n'),'text/csv;charset=utf-8');
});
$('exportWorkspace').addEventListener('click',()=>download('ups-director-workspace-backup.json',JSON.stringify({schemaVersion:3,exportedAt:new Date().toISOString(),projects:state.projects,assets:state.assets,theme:state.theme,master:state.master,moduleDrafts:state.moduleDrafts},null,2)));
$('importWorkspace').addEventListener('change',async e=>{
  try{
    const f=e.target.files[0];if(!f)return;const obj=JSON.parse(await f.text());UPSDCore.validateWorkspace(obj);if(obj.master)UPSDCore.validateMaster(obj.master);
    if(!confirm('Current local workspace will be replaced by this backup. Continue?'))return;
    state={...DEFAULT,projects:obj.projects,assets:obj.assets,theme:obj.theme||'light',master:obj.master||null,moduleDrafts:obj.moduleDrafts||{}};
    if(persist()){render();alert('Workspace imported successfully.');}
  }catch(err){alert('Import failed: '+err.message);}finally{e.target.value='';}
});
$('downloadMaster').addEventListener('click',()=>{if(state.master)download('master-audited.json',JSON.stringify(state.master,null,2));else alert('पहले master JSON load करें।');});
$('masterUpload').addEventListener('change',async e=>{
  try{const f=e.target.files[0];if(!f)return;loadMaster(JSON.parse(await f.text()));alert('Master configuration loaded.');}
  catch(err){alert('Master load failed: '+err.message);}finally{e.target.value='';}
});
$('runQC').addEventListener('click',runQC);
$('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');state.theme=document.body.classList.contains('dark')?'dark':'light';persist();});
$('clearWorkspace').addEventListener('click',()=>{
  if(confirm('Delete all local projects and asset metadata? Export a backup first.')){
    state.projects=[];state.assets=[];state.moduleDrafts={};persist();render();$('qcResults').innerHTML='<div class="empty">Workspace cleared.</div>';
  }
});
(async function init(){
  if(state.theme==='dark')document.body.classList.add('dark');
  try{
    const response=await fetch('../config/master_audited.json');
    if(response.ok){const obj=await response.json();loadMaster(obj);}
  }catch(err){console.warn('Automatic master load unavailable; use Settings > Load Master JSON.',err);}
  render();bindModules();document.querySelectorAll('[data-module-form]').forEach(restoreModuleForm);promptCount();
})();
