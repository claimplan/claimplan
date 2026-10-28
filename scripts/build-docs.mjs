import { readFile, writeFile, mkdir, copyFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyzeEnvelope } from '../dist/index.js';
import { pages } from '../site/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'artifacts/site');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const code = value => `<pre><code>${escape(value)}</code></pre>`;
const policy = JSON.parse(await readFile(join(root,'examples/policy.json'),'utf8'));
const report = analyzeEnvelope(await readFile(join(root,'examples/handover.xdr'),'utf8'),policy);
if (report.status !== 'pass') throw new Error('Documentation passing fixture no longer passes');
const temp = await mkdtemp(join(tmpdir(),'claimplan-docs-'));
let error;
try {
  const policyPath = join(temp,'invalid.json');
  await writeFile(policyPath, JSON.stringify({...policy,version:2}));
  const result = spawnSync(process.execPath,[join(root,'dist/cli.js'),'check',join(root,'examples/handover.xdr'),'--policy',policyPath,'--json'],{encoding:'utf8'});
  if (result.error || result.status !== 2) throw new Error('Documentation invalid-input example did not exit 2');
  error = JSON.parse(result.stdout);
  if (!error.error) throw new Error('Invalid-input example is missing error object');
} finally { await rm(temp,{recursive:true,force:true}); }
await mkdir(output,{recursive:true});
await copyFile(join(root,'site/style.css'),join(output,'style.css'));
const transcript = JSON.parse(await readFile(join(root,'site/media/demo-transcript.json'),'utf8'));
if (!transcript.ok || transcript.records.some(r=>r.exit !== r.expected)) throw new Error('Demo transcript contains a failed check');
for (const name of ['claimplan-demo.mp4','demo-transcript.json']) await copyFile(join(root,'site/media',name),join(output,name));
const rendered = new Map();
for (const [index,page] of pages.entries()) {
  const nav = pages.map(p=>`<a href="${p.slug}.html"${p.slug===page.slug?' aria-current="page"':''}>${escape(p.section)}</a>`).join('');
  const adjacent = (p,label) => p ? `<a href="${p.slug}.html">${label}: ${escape(p.section)}</a>` : '<span></span>';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="ClaimPlan documentation: offline Stellar claimable-balance policy checks, worked examples and exact CLI/library reference."><title>${escape(page.section)} | ClaimPlan</title><link rel="stylesheet" href="style.css"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%23087c77' d='M3 8h13v6H3z'/%3E%3Cpath fill='%23244ca4' d='M16 18h13v6H16z'/%3E%3C/svg%3E"></head><body><a class="skip" href="#main">Skip to content</a><header><a class="brand" href="index.html">ClaimPlan<span>Stellar payout policy reference</span></a><a class="repo" href="https://github.com/claimplan/claimplan">Source on GitHub</a></header><details class="mobile-nav"><summary>Documentation · ${escape(page.section)}</summary><nav aria-label="Mobile documentation">${nav}</nav></details><div class="layout"><aside class="sidebar"><nav aria-label="Documentation">${nav}</nav></aside><main id="main" tabindex="-1"><h1>${escape(page.title)}</h1>${page.body({code,policy,report,error,transcript})}<div class="page-next">${adjacent(pages[index-1],'Previous')}${adjacent(pages[index+1],'Next')}</div><footer>Experimental policy v1. No signing, submission or execution guarantee.<br><a href="https://github.com/claimplan/claimplan/blob/main/LICENSE">MIT license</a> · <a href="https://github.com/claimplan/claimplan/blob/main/SECURITY.md">Security reporting</a></footer></main></div></body></html>`;
  rendered.set(`${page.slug}.html`,html);
}
// Check every generated relative destination, so a broken navigation link fails CI.
const known = new Set([...rendered.keys(),'style.css','claimplan-demo.mp4','demo-transcript.json']);
for (const [name,html] of rendered) {
  for (const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('https://') || href.startsWith('data:image/svg+xml,') || href === '#main') continue;
    if (!known.has(href)) throw new Error(`Broken local link in ${name}: ${href}`);
  }
  await writeFile(join(output,name),html);
}
await writeFile(join(output,'.nojekyll'),'');
console.log(`Built ${rendered.size} documentation pages; local destinations and live analyzer examples verified.`);
