import {media} from './media.js';
import { assets } from '../.openai/local/assets.js';
import { home,legal,messagePage,whatsapp } from './page.js';
import { bookingSchema,whatsappMessage } from './schema.js';
const localLimits=new Map();
const canonical='https://meraki-salon-br.davi10boeira.chatgpt.site';
function secured(response,nonce,url) {
 const headers=new Headers(response.headers);
 const directives=["default-src 'none'","script-src 'self' 'nonce-"+nonce+"' https://challenges.cloudflare.com","style-src 'self'","img-src 'self' data:","font-src 'self'","connect-src 'self' https://challenges.cloudflare.com","frame-src https://www.google.com https://challenges.cloudflare.com","frame-ancestors 'none'","base-uri 'none'","form-action 'self' https://wa.me","object-src 'none'"];
 headers.set('Content-Security-Policy',directives.join('; '));headers.set('X-Content-Type-Options','nosniff');headers.set('X-Frame-Options','DENY');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()');headers.set('Cross-Origin-Opener-Policy','same-origin');headers.set('Strict-Transport-Security','max-age=63072000; includeSubDomains');
 if(!headers.has('Cache-Control'))headers.set('Cache-Control','no-store');
 return new Response(response.body,{status:response.status,headers});
}
async function limit(request,env,fetcher) {
 const ip=request.headers.get('cf-connecting-ip')||'unknown';
 const bucket=Math.floor(Date.now()/600000);
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+':'+bucket));
 const key='booking:'+Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(env.LOCAL_DEV){for(const[k,v]of localLimits)if(v.expires<Date.now())localLimits.delete(k);const state=localLimits.get(key)||{count:0,expires:Date.now()+600000};state.count++;localLimits.set(key,state);return state.count<=5;}
 if(!env.RATE_LIMIT_URL||!env.RATE_LIMIT_TOKEN)return null;
 const endpoint=new URL(env.RATE_LIMIT_URL);
 if(endpoint.protocol!=='https:')return null;
 const result=await fetcher(endpoint.origin,{method:'POST',headers:{Authorization:'Bearer '+env.RATE_LIMIT_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(["EVAL","local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n",1,key]),signal:AbortSignal.timeout(5000)});
 if(!result.ok)return null;const json=await result.json();if(!Number.isInteger(json.result))return null;return json.result<=5;
}
export async function booking(request,env={},fetcher=fetch) {
 const url=new URL(request.url),origin=url.origin;
 const wantsJson=request.headers.get('accept')?.includes('application/json');
 function reply(status,message,extra={}){if(wantsJson)return Response.json({message,...extra},{status,headers:{'Cache-Control':'no-store'}});return messagePage('Sua solicitação',message,origin,status);}
 if(request.method!=='POST')return reply(405,'Método não permitido.');
 if(request.headers.get('origin')!==origin||request.headers.get('sec-fetch-site')==='cross-site')return reply(403,'Solicitação não autorizada.');
 const type=request.headers.get('content-type')||'';
 if(!type.includes('application/json')&&!type.includes('application/x-www-form-urlencoded'))return reply(415,'Formato não permitido.');
 if(Number(request.headers.get('content-length'))>8192)return reply(413,'Solicitação muito grande.');
 let raw,channel;
 try{
 // Stream limit protects Workers against chunked oversized payloads.
 const reader=request.body?.getReader();if(!reader)return reply(400,'Revise os dados e tente novamente.');
 const chunks=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>8192){await reader.cancel();return reply(413,'Solicitação muito grande.');}chunks.push(value);}
 const buffer=new Uint8Array(total);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length;}const text=new TextDecoder().decode(buffer);
 raw=type.includes('application/json')?JSON.parse(text):Object.fromEntries(new URLSearchParams(text));
 channel=raw.channel||'email';delete raw.channel;raw.token=raw.token||raw['cf-turnstile-response']||'';delete raw['cf-turnstile-response'];if(!type.includes('application/json'))raw.consent=raw.consent==='true';
 }catch{return reply(400,'Revise os dados e tente novamente.');}
 if(!['whatsapp','email'].includes(channel))return reply(400,'Escolha um canal válido.');
 const parsed=bookingSchema.safeParse(raw);if(!parsed.success)return reply(400,'Revise os campos para continuar.',{errors:parsed.error.issues.map(i=>({field:i.path[0],message:i.message}))});
 const data=parsed.data;
 if(data.website)return reply(400,'Não foi possível concluir a solicitação.');
 try{
 const allowed=await limit(request,env,fetcher);
 if(allowed===false)return reply(429,'Muitas tentativas. Aguarde dez minutos e tente novamente.');
 if(channel==='whatsapp'){
 // No storage, external email or automatic booking: only a validated redirect.
 return new Response(null,{status:303,headers:{Location:whatsapp(whatsappMessage(data)),'Cache-Control':'no-store'}});
 }
 if(!env.TURNSTILE_SECRET_KEY||!env.TURNSTILE_SITE_KEY||!env.RESEND_API_KEY||!env.BOOKING_FROM||!env.BOOKING_TO||allowed===null)return reply(503,'O envio pelo site ainda não está disponível. Continue pelo WhatsApp para falar com a equipe.');
 if(!data.token)return reply(400,'Complete a verificação de segurança.');
 const verification=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.token,remoteip:request.headers.get('cf-connecting-ip')||undefined}),signal:AbortSignal.timeout(8000)});
 if(!verification.ok)return reply(503,'A verificação está indisponível. Tente novamente ou use o WhatsApp.');
 const result=await verification.json();
 if(!result.success||result.hostname!==url.hostname||result.action!=='booking')return reply(400,'Não foi possível verificar a solicitação. Tente novamente.');
 const sent=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({from:env.BOOKING_FROM,to:[env.BOOKING_TO],subject:'Solicitação de atendimento — Meraki Salon',text:whatsappMessage(data)}),signal:AbortSignal.timeout(10000)});
 if(!sent.ok)return reply(503,'Não foi possível enviar agora. Tente novamente ou use o WhatsApp.');
 return reply(200,'Solicitação enviada. Aguarde a equipe para confirmar seu horário.');
 }catch{return reply(503,'Não foi possível enviar agora. Tente novamente ou use o WhatsApp.');}
}
export default {async fetch(request,env={}) {
 const url=new URL(request.url),nonce=crypto.randomUUID().replaceAll('-','');
 const origin=env.LOCAL_DEV?url.origin:(env.SITE_URL||canonical);
 let response;
 if(url.pathname.startsWith('/media/')||url.pathname.startsWith('/api/media/'))response=await media(request,env);
 else if(url.pathname==='/api/agendamento')response=await booking(request,env);
 else if(!['GET','HEAD'].includes(request.method))response=new Response('Método não permitido.',{status:405,headers:{Allow:'GET, HEAD'}});
 else if(assets[url.pathname]){const a=assets[url.pathname];response=new Response(Uint8Array.from(atob(a.data),c=>c.charCodeAt(0)),{headers:{'Content-Type':a.type,'Cache-Control':'public, max-age=3600'}});}
 else if(url.pathname==='/'){
 const emailReady=env.TURNSTILE_SITE_KEY&&env.TURNSTILE_SECRET_KEY&&env.RESEND_API_KEY&&env.BOOKING_FROM&&env.BOOKING_TO&&env.RATE_LIMIT_URL?.startsWith('https://')&&env.RATE_LIMIT_TOKEN;
 response=new Response(home(origin,nonce,emailReady?env.TURNSTILE_SITE_KEY:'',env.LOCAL_DEV||env.SPACE_GALLERY_READY==='true',Number(env.SPACE_PHOTO_COUNT)||0),{headers:{'Content-Type':'text/html; charset=utf-8'}});
 }
 else if(url.pathname==='/privacidade'||url.pathname==='/termos')response=new Response(legal(url.pathname.slice(1),origin),{headers:{'Content-Type':'text/html; charset=utf-8'}});
 else if(url.pathname==='/robots.txt')response=new Response('User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: '+origin+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
 else if(url.pathname==='/sitemap.xml')response=new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/privacidade','/termos'].map(p=>'<url><loc>'+origin+p+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
 else response=messagePage('Página não encontrada','Volte ao início para conhecer o Meraki Salon.',origin,404);
 return secured(response,nonce,url);
}};

