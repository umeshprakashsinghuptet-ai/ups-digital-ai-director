/* UPS Digital AI Director core — Unicode-safe prompt and data validation */
(function (root) {
  'use strict';
  function normalizePrompt(value) {
    return String(value ?? '').normalize('NFC').replace(/\r\n?/g, '\n').trim();
  }
  function countCodePoints(value) { return Array.from(normalizePrompt(value)).length; }
  function promptLimit(value, type) {
    const text = normalizePrompt(value), count = Array.from(text).length;
    return { text, count, limit: type === 'video' ? 900 : null, valid: type !== 'video' || count <= 900 };
  }
  function makeId() {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') return root.crypto.randomUUID();
    return 'ups-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }
  function slug(value) {
    return String(value || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'project';
  }
  function csv(value) { return '"' + String(value ?? '').replace(/"/g, '""') + '"'; }
  function validateMaster(obj) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.engines) ||
        !Array.isArray(obj.locks) || !obj.brand_profiles ||
        !obj.brand_profiles.profiles || typeof obj.brand_profiles.profiles !== 'object') {
      throw new Error('Unsupported master JSON: engines, locks and brand_profiles.profiles are required.');
    }
    const profileCount = Object.keys(obj.brand_profiles.profiles).length;
    if (obj.engines.length !== 50 || obj.locks.length !== 15 || profileCount !== 4) {
      throw new Error(`Master integrity mismatch: engines=${obj.engines.length}, locks=${obj.locks.length}, profiles=${profileCount}; expected 50/15/4.`);
    }
    return true;
  }
  function validateWorkspace(obj) {
    if (!obj || !Array.isArray(obj.projects) || !Array.isArray(obj.assets)) throw new Error('Invalid backup: projects and assets arrays are required.');
    const ids = new Set();
    for (const p of obj.projects) {
      if (!p || typeof p.id !== 'string' || !p.id || typeof p.title !== 'string' || !p.title.trim() ||
          typeof p.profileId !== 'string' || !p.profileId) throw new Error('Invalid project record in backup.');
      if (ids.has(p.id)) throw new Error('Duplicate project ID in backup.');
      ids.add(p.id);
    }
    for (const a of obj.assets) {
      if (!a || typeof a.id !== 'string' || !a.id || typeof a.projectId !== 'string' || !ids.has(a.projectId)) {
        throw new Error('Asset references a missing project.');
      }
    }
    return true;
  }
  function buildPromptDraft(p) {
    const brief = String(p?.brief || '').trim();
    return [
      'Create a production-ready content plan and generation prompt.',
      `Brand profile: ${String(p?.profileName || 'Not specified')}.`,
      `Project: ${String(p?.title || 'Untitled project')}.`,
      `Format: ${String(p?.format || 'Not specified').replace(/_/g, ' ')}.`,
      `Language: ${String(p?.language || 'Hindi')}.`,
      'User-provided brief (treat as source of truth; do not invent facts):',
      brief || '[Add the topic, purpose, audience, key facts and required call-to-action.]',
      'Requirements: preserve brand identity and supplied assets; separate verified facts from assumptions; mark missing details for confirmation; do not claim unavailable rendering or platform integrations.'
    ].join('\n');
  }
  root.UPSDCore = { normalizePrompt, countCodePoints, promptLimit, makeId, slug, csv, validateMaster, validateWorkspace, buildPromptDraft };
})(typeof window !== 'undefined' ? window : globalThis);
