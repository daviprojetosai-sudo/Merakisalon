import content from '../content.json' with {type:'json'};

const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window){
 if($('#header-sentinel'))new IntersectionObserver(es=>$('.header')?.classList.toggle('scrolled',!es[0].isIntersecting)).observe($('#header-sentinel'));
 if(!reduced){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');observer.unobserve(entry.target);}},{threshold:.08});document.querySelectorAll('[data-reveal]').forEach((el,i)=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-pending');el.style.transitionDelay=(i%3)*80+'ms';observer.observe(el);}});}
}
const mobile=$('.mobile-nav');
mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.open=false;}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile?.open){mobile.open=false;mobile.querySelector('summary').focus();}});
document.addEventListener('click',e=>{if(mobile?.open&&!mobile.contains(e.target))mobile.open=false;});
const form=$('#booking-form'),status=$('#form-status');
document.querySelectorAll('[data-select-service]').forEach(a=>a.addEventListener('click',()=>{if(form)form.elements.service.value=a.dataset.selectService;}));
const dialog=$('#lightbox');let opener=null;
document.querySelectorAll('.gallery-open').forEach(a=>a.addEventListener('click',event=>{if(!dialog?.showModal)return;event.preventDefault();opener=a;const item=content.gallery.find(i=>i.id===a.dataset.gallery);$('#lightbox-image').src='/assets/'+item.file;$('#lightbox-image').alt=item.alt;$('#lightbox-title').textContent=item.title;dialog.showModal();$('#lightbox-close').focus();}));
$('#lightbox-close')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog?.addEventListener('close',()=>opener?.focus());
let galleryIndex=2;
function galleryStep(direction){galleryIndex=(galleryIndex+direction+content.gallery.length)%content.gallery.length;document.querySelectorAll('.gallery-item').forEach((figure,i)=>{const item=content.gallery[(galleryIndex+i-1+content.gallery.length)%content.gallery.length],a=figure.querySelector('a'),image=figure.querySelector('img');a.href='/assets/'+item.file;a.dataset.gallery=item.id;a.setAttribute('aria-label','Ampliar: '+item.title);image.src=a.href;image.alt=item.alt;figure.querySelector('.eyebrow').textContent=item.category;figure.querySelector('.gallery-caption').textContent=item.title;});$('#gallery-count').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(content.gallery.length).padStart(2,'0');}
$('#gallery-prev')?.addEventListener('click',()=>galleryStep(-1));$('#gallery-next')?.addEventListener('click',()=>galleryStep(1));
$('#load-map')?.addEventListener('click',()=>{const iframe=document.createElement('iframe');iframe.title='Localização do Meraki Salon em Caxias do Sul';iframe.referrerPolicy='no-referrer';iframe.loading='lazy';iframe.src='https://www.google.com/maps?q='+encodeURIComponent('Meraki Salon, Rua Dom José Baréa 1813, Caxias do Sul')+'&output=embed';$('.map-placeholder').replaceChildren(iframe);});
let captchaLoaded=false;
function resetCaptcha(){if(window.turnstile&&captchaLoaded)window.turnstile.reset();}
function loadCaptcha(){if(captchaLoaded||!form.dataset.sitekey)return;captchaLoaded=true;const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>window.turnstile.render('#captcha',{sitekey:form.dataset.sitekey,action:'booking',theme:'light'});script.onerror=()=>{captchaLoaded=false;status.textContent='A verificação não carregou. Tente novamente ou use o WhatsApp.';};document.head.append(script);}
if(form){form.noValidate=true;form.elements.date.min=new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});form.elements.date.max=new Date(Date.now()+366*86400000).toISOString().slice(0,10);
form.addEventListener('submit',async event=>{event.preventDefault();const data=Object.fromEntries(new FormData(form));delete data['cf-turnstile-response'];data.consent=form.elements.consent.checked;data.token=window.turnstile&&captchaLoaded?window.turnstile.getResponse():'';
document.querySelectorAll('.field-error').forEach(el=>el.textContent='');form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));$('#whatsapp-result').hidden=true;
const {bookingSchema,whatsappMessage}=await import('./schema.js');
const parsed=bookingSchema.safeParse(data);
if(!parsed.success){for(const issue of parsed.error.issues){const name=issue.path[0],error=document.getElementById(name+'-error');if(error&&!error.textContent){error.textContent=issue.message;form.elements[name]?.setAttribute('aria-invalid','true');}}status.textContent='Revise os campos indicados para continuar.';status.dataset.error='true';form.querySelector('[aria-invalid=true]')?.focus();return;}
const channel=event.submitter?.value||'whatsapp';
if(channel==='whatsapp'){const link=$('#whatsapp-result');link.href='https://wa.me/'+content.phone+'?text='+encodeURIComponent(whatsappMessage(parsed.data));link.hidden=false;status.textContent='Sua mensagem está pronta. Clique abaixo para revisar e enviar no WhatsApp.';status.dataset.error='false';link.focus();return;}
if(!form.dataset.sitekey){status.textContent='O envio pelo site ainda não está disponível. Continue pelo WhatsApp para falar com a equipe.';status.dataset.error='true';return;}
if(!data.token){loadCaptcha();status.textContent='Complete a verificação e clique novamente para enviar.';status.dataset.error='true';return;}
const buttons=form.querySelectorAll('button[type=submit]');buttons.forEach(b=>b.disabled=true);status.textContent='Enviando sua solicitação…';status.dataset.error='false';
try{const response=await fetch('/api/agendamento',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...parsed.data,channel:'email'})});const result=await response.json();if(!response.ok)throw Error(result.message||'Não foi possível enviar. Tente novamente ou use o WhatsApp.');status.textContent='Solicitação enviada. Aguarde a equipe para confirmar o horário.';form.reset();}
catch(error){status.textContent=error.message||'Não foi possível enviar. Tente novamente ou use o WhatsApp.';status.dataset.error='true';}
finally{resetCaptcha();buttons.forEach(b=>b.disabled=false);}
});}

dialog?.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled);const first=controls[0],last=controls.at(-1);if(!first)return;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});


const reviewTrack=$('#reviews-track'),reviewPrev=$('#reviews-prev'),reviewNext=$('#reviews-next');
if(reviewTrack&&reviewPrev&&reviewNext){
 const reviewStatus=$('#reviews-status');
 function reviewControls(){const max=reviewTrack.scrollWidth-reviewTrack.clientWidth,overflows=max>2;reviewPrev.hidden=!overflows;reviewNext.hidden=!overflows;reviewPrev.disabled=reviewTrack.scrollLeft<=2;reviewNext.disabled=reviewTrack.scrollLeft>=max-2;}
 function reviewMove(direction){const distance=reviewTrack.querySelector('.review').getBoundingClientRect().width+parseFloat(getComputedStyle(reviewTrack).gap);reviewTrack.scrollBy({left:direction*distance,behavior:reduced?'instant':'smooth'});reviewStatus.textContent=direction>0?'Próximas avaliações.':'Avaliações anteriores.';}
 reviewPrev.addEventListener('click',()=>reviewMove(-1));reviewNext.addEventListener('click',()=>reviewMove(1));
 reviewTrack.addEventListener('keydown',event=>{if(event.target!==reviewTrack)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();reviewMove(event.key==='ArrowRight'?1:-1);}else if(event.key==='Home'||event.key==='End'){event.preventDefault();reviewTrack.scrollTo({left:event.key==='Home'?0:reviewTrack.scrollWidth,behavior:reduced?'instant':'smooth'});}});
 let reviewFrame=0;reviewTrack.addEventListener('scroll',()=>{if(!reviewFrame)reviewFrame=requestAnimationFrame(()=>{reviewControls();reviewFrame=0;});},{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(reviewControls).observe(reviewTrack);else window.addEventListener('resize',reviewControls);
 reviewControls();
}

// Keep the floating shortcut clear of visible in-section actions on phones.
if('IntersectionObserver' in window){const shortcut=$('.floating-whatsapp');if(shortcut){const visibleActions=new Set();const updateShortcut=()=>{shortcut.hidden=matchMedia('(max-width:767px)').matches&&visibleActions.size>0;};const avoidOverlay=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visibleActions.add(entry.target);else visibleActions.delete(entry.target);}updateShortcut();},{threshold:.15});document.querySelectorAll('.reviews-bottom,.form-submit,.booking-copy .button').forEach(el=>avoidOverlay.observe(el));window.addEventListener('resize',updateShortcut);}}
