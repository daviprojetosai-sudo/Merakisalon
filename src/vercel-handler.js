import worker from './worker.js';
import content from '../content.json' with {type:'json'};

// Only these settings may enter the existing application on Vercel.
// Cloudflare bindings and upload credentials are deliberately not forwarded.
const configurationKeys=['TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','RESEND_API_KEY','BOOKING_FROM','BOOKING_TO','RATE_LIMIT_URL','RATE_LIMIT_TOKEN'];
export function vercelEnvironment(request,environment={}){
 const settings=Object.fromEntries(configurationKeys.filter(key=>environment[key]).map(key=>[key,environment[key]]));
 const origin=new URL(environment.SITE_URL||request.url);
 if(origin.username||origin.password||!['https:','http:'].includes(origin.protocol))throw Error('Invalid site origin');
 if(origin.protocol==='http:'&&!['localhost','127.0.0.1'].includes(origin.hostname))throw Error('HTTPS is required');
 return {...settings,SITE_URL:origin.origin,SPACE_GALLERY_READY:'true',SPACE_PHOTO_COUNT:String(content.spaceGallery.length),MEDIA_UPLOAD_ENABLED:'false'};
}

export async function handleRequest(request,environment={}){
 return worker.fetch(request,vercelEnvironment(request,environment));
}

export default async function handler(req,res){
 try{
  const host=String(req.headers.host||process.env.VERCEL_URL||'');
  if(!/^[a-z0-9][a-z0-9.:-]*$/i.test(host)){
   res.writeHead(400,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Solicitação inválida.');return;
  }
  const local=/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const origin=(local&&process.env.VERCEL!=='1'?'http://':'https://')+host;
  const path=new URL(req.url,'https://internal.invalid');
  const headers=new Headers();
  for(const [key,value] of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);
  // Vercel overwrites x-forwarded-for at its edge. Local checks use the socket.
  headers.delete('cf-connecting-ip');
  const ip=process.env.VERCEL==='1'?String(req.headers['x-forwarded-for']||'').split(',')[0].trim():req.socket?.remoteAddress;
  if(ip)headers.set('cf-connecting-ip',ip);
  const chunks=[];let size=0;
  if(!['GET','HEAD'].includes(req.method))for await(const chunk of req){
   size+=chunk.length;
   if(size>8192){res.writeHead(413,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end('Solicitação muito grande.');return;}
   chunks.push(chunk);
  }
  const request=new Request(origin+path.pathname+path.search,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const response=await handleRequest(request,process.env);
  res.writeHead(response.status,Object.fromEntries(response.headers));
  res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch(error){
  console.error('Meraki request failed:',error.name);
  if(!res.headersSent)res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end('Não foi possível concluir a solicitação.');
 }
}
