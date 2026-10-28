// Default is read-only. --apply creates missing issues or updates known ones, never reopens/closes.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const apply = process.argv.includes('--apply');
if (process.argv.slice(2).some(arg=>arg!=='--apply')) throw new Error('Usage: node scripts/sync-issues.mjs [--apply]');
const repo='claimplan/claimplan';
function gh(args,input){
  const result=spawnSync('gh',args,{encoding:'utf8',input});
  if(result.error || result.status!==0) throw new Error(result.stderr || result.error?.message || 'gh failed');
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}
const specs=JSON.parse(readFileSync(new URL('../checks/backlog/issues.json',import.meta.url),'utf8'));
const existing=gh(['api',`repos/${repo}/issues?state=all&per_page=100`]);
const labels=gh(['api',`repos/${repo}/labels?per_page=100`]);
for(const label of new Set(specs.flatMap(s=>s.labels))){
  if(!labels.some(l=>l.name===label)){
    console.log(`${apply?'Create':'Would create'} label: ${label}`);
    if(apply) gh(['api','--method','POST',`repos/${repo}/labels`,'--input','-'],JSON.stringify({name:label,color:label==='optional'?'d5deec':'3462a8',description:'Project scope metadata; no funding or assignment implied.'}));
  }
}
for(const spec of specs){
  const marker=`<!-- claimplan-backlog:${spec.key} -->`;
  const issue=existing.find(i=>!i.pull_request && (i.number===spec.existingNumber || i.body?.includes(marker)));
  const payload={title:spec.title,body:spec.body+'\n'+marker+'\n',labels:[...new Set([...(issue?.labels??[]).map(l=>l.name),...spec.labels])]};
  console.log(`${apply?'Sync':'Would sync'} ${spec.key}: ${issue?'#'+issue.number:'new issue'}`);
  if(apply){
    const result=gh(['api','--method',issue?'PATCH':'POST',`repos/${repo}/issues${issue?'/'+issue.number:''}`,'--input','-'],JSON.stringify(payload));
    console.log(result.html_url);
  }
}
