import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const built=spawnSync(process.execPath,['scripts/build-vercel.mjs'],{stdio:'inherit'});if(built.status)process.exit(built.status);
const {default:handler}=await import(pathToFileURL(path.resolve('.vercel/output/functions/index.func/index.mjs')));
const {assets}=await import('../.openai/local/assets.js');
const mediaManifest=JSON.parse(await readFile('assets/space/media-manifest.json','utf8'));
const allowed=new Set([...Object.keys(assets),...Object.keys(mediaManifest).map(name=>'/media/'+name)]);
const types={'.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const port=Number(process.env.PORT||4194);
const server=createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(['GET','HEAD'].includes(req.method)&&allowed.has(pathname)){
   const bytes=await readFile(path.join('.vercel/output/static',pathname.slice(1)));
   res.writeHead(200,{'Content-Type':types[path.extname(pathname)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':pathname.startsWith('/media/')?'public, max-age=31536000, immutable':'public, max-age=3600'});
   res.end(req.method==='HEAD'?undefined:bytes);return;
  }
  await handler(req,res);
 }catch{res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Não foi possível concluir a solicitação.');}
});
server.listen(port,'127.0.0.1',()=>console.log('Vercel local (sem deploy): http://localhost:'+port));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
