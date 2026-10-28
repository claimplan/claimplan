// Development-only loopback viewer: streams actual CLI runs for a screen recording.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
const root = fileURLToPath(new URL('../',import.meta.url));
const steps = [
  ['Valid two-recipient handover','examples/payout.xdr','examples/payout-policy.json',0],
  ['Broken second-operation overlap','examples/payout-overlap.xdr','examples/payout-policy.json',1],
  ['Missing creation-time assumption','examples/handover.xdr','examples/missing-time.json',2],
];
let started=false;
const html = String.raw`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ClaimPlan actual CLI recording</title><style>body{margin:0;padding:44px;background:#f5f7fc;color:#202d4a;font:22px/1.6 system-ui}h1{font-size:34px;margin:0 0 8px}p{margin:0 0 22px;color:#506179;font-size:18px}pre{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font:18px/1.6 monospace;background:white;border:1px solid #d5deec;padding:24px;border-radius:6px;min-height:460px}#state{margin-top:20px;color:#244ca4;font-size:18px}</style><h1>ClaimPlan · actual offline CLI run</h1><p>Unsigned synthetic fixtures. No signing or submission. Exit 0 / 1 / 2.</p><pre id="terminal">Starting the real command…</pre><p id="state">Each panel displays subprocess output streamed over loopback.</p><script>const out=document.querySelector('#terminal');const state=document.querySelector('#state');const events=new EventSource('/events');events.onmessage=({data})=>{const e=JSON.parse(data);if(e.type==='start'){out.textContent=e.command+'\n\n';state.textContent=e.title;}if(e.type==='output')out.textContent+=e.text;if(e.type==='exit'){out.textContent+='\nProcess exit: '+e.code;state.textContent=e.ok?'Observed exit matches the expected result.':'Unexpected result — recording failed.';}if(e.type==='done'){state.textContent=e.ok?'Complete: all three actual exits matched. Predicate checks do not guarantee execution.':'Recording failed.';document.body.dataset.done=e.ok?'pass':'fail';events.close();}};</script></html>`;
const server=createServer(async(req,res)=>{
  if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(req.url==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(html);return;}
  if(req.url!=='/events'){res.writeHead(404);res.end();return;}
  if(started){res.writeHead(409);res.end('Restart server for another recording.');return;}
  started=true;res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache'});
  const send=e=>res.write('data: '+JSON.stringify(e)+'\n\n');
  const records=[];let ok=true;
  try{
    for(const [title,xdr,policy,expected] of steps){
      const args=['dist/cli.js','check',xdr,'--policy',policy];
      const record={title,command:'node '+args.join(' '),expected,output:''};
      send({type:'start',title,command:'$ '+record.command});await pause(1800);
      const code=await new Promise((resolve,reject)=>{
        const child=spawn(process.execPath,args,{cwd:root,stdio:['ignore','pipe','pipe']});
        const collect=data=>{const text=data.toString();record.output+=text;send({type:'output',text});};
        child.stdout.on('data',collect);child.stderr.on('data',collect);child.once('error',reject);child.once('close',resolve);
      });
      record.exit=code;records.push(record);ok&&=code===expected;send({type:'exit',code,ok:code===expected});await pause(6500);
    }
    await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
    await writeFile(new URL('../artifacts/demo-transcript.json',import.meta.url),JSON.stringify({node:process.version,records,ok},null,2)+'\n');
    send({type:'done',ok});res.end();
  }catch(error){console.error(error);send({type:'done',ok:false});res.end();}
});
server.listen(8766,'127.0.0.1',()=>console.log('Recording viewer: http://127.0.0.1:8766 (one session; restart to repeat)'));
