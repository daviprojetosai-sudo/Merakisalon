import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'}); if(r.status) process.exit(r.status);
const {default:worker}=await import(pathToFileURL(process.cwd()+'/dist/server/index.js'));
const port=Number(process.env.PORT||4173);
const server=createServer(async(req,res)=>{
 try {
 const chunks=[]; let size=0;
 for await (const c of req) { size+=c.length;if(size>8192){res.writeHead(413);res.end('Solicitação muito grande.');return;}chunks.push(c); }
 const origin='http://localhost:'+port;
 const headers=new Headers();for(const [k,v] of Object.entries(req.headers)) if(v) headers.set(k,Array.isArray(v)?v.join(', '):v);
 // Local adapter derives client IP from the socket, never from a user-controlled header.
 headers.set('cf-connecting-ip',req.socket.remoteAddress||'local');
 const body=Buffer.concat(chunks);
 const request=new Request(origin+req.url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body}: {})});
 const response=await worker.fetch(request,{...process.env,LOCAL_DEV:process.env.NODE_ENV!=='production'},{waitUntil:()=>{}});
 res.writeHead(response.status,Object.fromEntries(response.headers));
 res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch {res.writeHead(500);res.end('Não foi possível concluir a solicitação.');}
});
server.listen(port,'127.0.0.1',()=>console.log('Local: http://localhost:'+port));
for(const s of ['SIGINT','SIGTERM'])process.on(s,()=>server.close(()=>process.exit(0)));

