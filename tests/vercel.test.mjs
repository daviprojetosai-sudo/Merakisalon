import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest,vercelEnvironment} from '../src/vercel-handler.js';

test('Vercel usa sua própria origem nos metadados e mantém todas as fotos',async()=>{
 const response=await handleRequest(new Request('https://meraki-example.vercel.app/'));
 const html=await response.text();assert.equal(response.status,200);assert.match(html,/rel="canonical" href="https:\/\/meraki-example\.vercel\.app\/?"/);assert.doesNotMatch(html,/meraki-salon-br\.davi10boeira\.chatgpt\.site/);
 assert.equal((html.match(/data-space-photo=/g)||[]).length,19);assert.equal((html.match(/class="bridal-slide"/g)||[]).length,6);assert.doesNotMatch(html,/class="email-submit"/);
});
test('adaptador não habilita uploads ou modo de desenvolvimento por variáveis herdadas',async()=>{
 const request=new Request('https://meraki-example.vercel.app/');const env=vercelEnvironment(request,{LOCAL_DEV:true,BUCKET:{},MEDIA_UPLOAD_ENABLED:'true',MEDIA_UPLOAD_TOKEN:'secret',UNRELATED:'value'});
 assert.equal(env.MEDIA_UPLOAD_ENABLED,'false');assert.equal(env.LOCAL_DEV,undefined);assert.equal(env.BUCKET,undefined);assert.equal(env.MEDIA_UPLOAD_TOKEN,undefined);assert.equal(env.UNRELATED,undefined);
 const response=await handleRequest(new Request('https://meraki-example.vercel.app/api/media/space-19-thumb-cd0d37e1c72f.webp',{method:'PUT'}),{MEDIA_UPLOAD_ENABLED:'true',MEDIA_UPLOAD_TOKEN:'secret'});assert.equal(response.status,404);
});
test('origem fixa permite HTTPS e rejeita credenciais e esquemas inseguros',()=>{
 const request=new Request('https://meraki-example.vercel.app/');assert.equal(vercelEnvironment(request,{SITE_URL:'https://meraki.example/'}).SITE_URL,'https://meraki.example');
 for(const SITE_URL of ['javascript:alert(1)','https://user:secret@meraki.example/','http://meraki.example/'])assert.throws(()=>vercelEnvironment(request,{SITE_URL}));
});
test('agendamento WhatsApp no adaptador preserva validação, destino oficial e CSRF',async()=>{
 const origin='https://meraki-example.vercel.app';const data={name:'Teste Vercel',phone:'(54) 99999-9999',service:'cabelos',date:new Date(Date.now()+86400000).toISOString().slice(0,10),time:'14:30',notes:'Teste local\nSem envio real',consent:true,channel:'whatsapp'};
 const request=(from=origin)=>new Request(origin+'/api/agendamento',{method:'POST',headers:{Origin:from,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
 const response=await handleRequest(request());assert.equal(response.status,303);assert.match(response.headers.get('location'),/^https:\/\/wa.me\/5554999321003\?text=/);assert.equal((await handleRequest(request('https://attacker.example'))).status,403);
});
