import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://localhost:4193';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={viewports:[],a11y:[],errors:[],flows:[],broken:[],thirdPartyRequests:[]};
try{
 for(const width of [320,360,390,720,768,1024,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)report.broken.push({url:r.url(),status:r.status()});});
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await expect(page.locator('h1')).toHaveCount(1);
  const targets=await page.locator('button,summary').evaluateAll(els=>els.filter(e=>e.getClientRects().length).map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(r=>r.w<44||r.h<44));
  expect(targets).toEqual([]);report.viewports.push({width,overflow:false,smallButtonTargets:targets.length});
  if([390,1440].includes(width)){
   await page.screenshot({path:`qa/audit-after-hero-${width}.png`});
   for(const id of ['galeria','servicos','sobre','nosso-espaco','espaco-noiva','agendamento','contato']){
    await page.locator('#'+id).scrollIntoViewIfNeeded();await page.locator('#'+id+' img').evaluateAll(imgs=>Promise.all(imgs.filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0&&r.width>0;}).map(i=>i.decode())));
    await page.screenshot({path:`qa/audit-after-${id}-${width}.png`});
   }
   await page.locator('#booking-form').scrollIntoViewIfNeeded();await expect(page.locator('.floating-whatsapp')).toBeHidden();
   const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   report.a11y.push({width,violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});expect(a.violations).toEqual([]);
  }
  await context.close();
 }
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();
 p.on('pageerror',e=>report.errors.push(e.message));
 p.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))report.thirdPartyRequests.push(r.url());});
 await p.goto(base);await p.locator('#agendamento').scrollIntoViewIfNeeded();
 expect(report.thirdPartyRequests).toEqual([]);
 await expect(p.locator('.email-submit')).toHaveCount(0);
 await p.locator('#booking-form button[value=whatsapp]').click();await expect(p.locator('#name')).toHaveAttribute('aria-invalid','true');
 await p.locator('#name').fill('Cliente Teste');await p.locator('#phone').fill('(54) 99999-9999');await p.locator('#service').selectOption('cabelos');await p.locator('#date').fill(new Date(Date.now()+86400000).toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'}));await p.locator('#time').fill('14:30');await p.locator('#notes').fill('Primeira linha\nSegunda linha');await p.locator('#consent').check();await p.locator('#booking-form button[value=whatsapp]').click();await expect(p.locator('#whatsapp-result')).toBeVisible();await expect(p.locator('#whatsapp-result')).toHaveAttribute('href',/^https:\/\/wa.me\/5554999321003\?text=/);report.flows.push('Validação, multiline e mensagem para WhatsApp oficial');
 await p.locator('#galeria').scrollIntoViewIfNeeded();
 const ids=new Set();for(let i=0;i<5;i++){ids.add(await p.locator('.gallery-item-1 a').getAttribute('data-gallery'));await p.locator('#gallery-next').click();await p.waitForTimeout(150);}
 expect([...ids].sort()).toEqual(['bridal','brows','hair','makeup','nails']);await expect(p.locator('#gallery-count')).toHaveText('02 / 05');
 await p.locator('.gallery-item-1 a').click();await expect(p.locator('#lightbox')).toBeVisible();await p.keyboard.press('Tab');expect(await p.evaluate(()=>!!document.activeElement.closest('#lightbox'))).toBe(true);await p.keyboard.press('Escape');await expect(p.locator('.gallery-item-1 a')).toBeFocused();report.flows.push('5 categorias, retorno do carrossel, ampliação e teclado');
 await expect(p.locator('[data-space-photo]')).toHaveCount(19);await p.locator('[data-space-photo="18"]').click();await expect(p.locator('#space-position')).toContainText('19 / 19');await p.keyboard.press('Home');await expect(p.locator('#space-position')).toContainText('01 / 19');await p.keyboard.press('ArrowLeft');await expect(p.locator('#space-position')).toContainText('19 / 19');await p.keyboard.press('Escape');await expect(p.locator('[data-space-photo="18"]')).toBeFocused();report.flows.push('19 fotos do espaço e navegação circular por teclado');
 await p.locator('#espaco-noiva').scrollIntoViewIfNeeded();await expect(p.locator('.bridal-slide')).toHaveCount(6);await expect(p.locator('#bridal-toggle')).toHaveAccessibleName('Reproduzir carrossel');await p.locator('[data-bridal-photo="5"]').click();await expect(p.locator('#bridal-count')).toHaveText('06 / 06');await p.locator('#bridal-next').click();await expect(p.locator('#bridal-count')).toHaveText('01 / 06');await p.locator('#bridal-toggle').click();await expect(p.locator('#bridal-toggle')).toHaveAccessibleName('Pausar carrossel');await p.locator('#bridal-toggle').click();report.flows.push('6 fotos de noiva, pausa, reprodução e redução de movimento');
 await p.locator('.mobile-nav summary').click();await expect(p.locator('.mobile-nav')).toHaveAttribute('open','');await p.keyboard.press('Escape');await expect(p.locator('.mobile-nav')).not.toHaveAttribute('open','');
 await p.locator('.faq summary').first().click();await expect(p.locator('.faq').first()).toHaveAttribute('open','');report.flows.push('Menu mobile e perguntas frequentes');
 await p.route('https://www.google.com/maps**',route=>route.fulfill({status:200,contentType:'text/html',body:'<html lang="pt-BR"><title>Mapa de teste</title></html>'}));await p.locator('#load-map').click();await expect(p.locator('.map-placeholder iframe')).toHaveAttribute('src',/^https:\/\/www.google.com\/maps\?/);report.flows.push('Mapa externo é solicitado somente após clique (resposta simulada)');
 await c.close();
 const legalContext=await browser.newContext({viewport:{width:390,height:844}}),lp=await legalContext.newPage();lp.on('pageerror',e=>report.errors.push(e.message));lp.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/inexistente'))report.broken.push({url:r.url(),status:r.status()});});
 for(const path of ['/privacidade','/termos','/inexistente']){await lp.goto(base+path);const a=await new AxeBuilder({page:lp}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();report.a11y.push({path,violations:a.violations.map(v=>v.id)});expect(a.violations).toEqual([]);await lp.locator('.mobile-nav summary').click();if(path!='/inexistente'){await lp.keyboard.press('Escape');await expect(lp.locator('.mobile-nav')).not.toHaveAttribute('open','');}}
 await legalContext.close();
 const nj=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),np=await nj.newPage();await np.goto(base);await np.locator('.mobile-nav summary').click();await expect(np.locator('.mobile-nav nav')).toBeVisible();await np.locator('.faq summary').first().click();await expect(np.locator('.faq p').first()).toBeVisible();report.flows.push('Sem JS: conteúdo, menu, FAQ e formulário nativos');await nj.close();
 expect(report.broken).toEqual([]);expect(report.errors).toEqual([]);
 await writeFile('qa/audit-after.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}


