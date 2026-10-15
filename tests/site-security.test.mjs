import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{booking} from '../src/worker.js';
import {home} from '../src/page.js';
const fetchPage=(path='/',env={})=>worker.fetch(new Request('https://meraki.test'+path),env);
test('páginas e erros recebem políticas de segurança e nonce único',async()=>{
 const a=await fetchPage(),b=await fetchPage();
 for(const response of [a,b,await fetchPage('/inexistente')]){
  const csp=response.headers.get('content-security-policy');
  assert.match(csp,/default-src 'none'/);assert.match(csp,/frame-ancestors 'none'/);assert.doesNotMatch(csp,/unsafe-inline|unsafe-eval/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('x-frame-options'),'DENY');assert.equal(response.headers.get('cache-control'),'no-store');
 }
 assert.notEqual(a.headers.get('content-security-policy'),b.headers.get('content-security-policy'));
 assert.match(await a.text(),/"telephone":"\+5554999321003"/);
});
test('email só aparece quando todos os provedores obrigatórios estão configurados',async()=>{
 for(const env of [{},{TURNSTILE_SITE_KEY:'site'}])assert.doesNotMatch(await (await fetchPage('/',env)).text(),/class="email-submit"/);
 const env={TURNSTILE_SITE_KEY:'site',TURNSTILE_SECRET_KEY:'secret',RESEND_API_KEY:'resend',BOOKING_FROM:'from@test',BOOKING_TO:'to@test',RATE_LIMIT_URL:'https://redis.test',RATE_LIMIT_TOKEN:'token'};
 const html=await(await fetchPage('/',env)).text();assert.match(html,/class="email-submit"/);assert.doesNotMatch(html,/resend|redis\.test|data-sitekey="secret"/);
});
test('HTML escapa valores de configuração; métodos e formatos incorretos são rejeitados',async()=>{
 assert.doesNotMatch(home('https://meraki.test','nonce','"><script>alert(1)</script>'),/data-sitekey=""><script>/);
 assert.equal((await worker.fetch(new Request('https://meraki.test/',{method:'POST'}))).status,405);
 const request=new Request('https://meraki.test/api/agendamento',{method:'POST',headers:{Origin:'https://meraki.test','Content-Type':'text/plain'},body:'x'});
 assert.equal((await booking(request)).status,415);
 assert.equal((await booking(new Request(request.url))).status,405);
});
