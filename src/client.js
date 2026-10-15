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
// Decode the incoming photos before blending away the current, fully visible frame.
let galleryIndex=1,galleryTarget=1,galleryChanging=false;
const galleryFigures=[...document.querySelectorAll('.gallery-item')],galleryMotion=matchMedia('(prefers-reduced-motion: reduce)'),galleryDecoded=new Map();
function decodeGalleryPhoto(item){
 const url='/assets/'+item.file;
 if(!galleryDecoded.has(url)){
  const image=new Image();image.src=url;
  galleryDecoded.set(url,image.decode().catch(error=>{galleryDecoded.delete(url);throw error;}));
 }
 return galleryDecoded.get(url);
}
async function renderGallery(next){
 const items=galleryFigures.map((_,i)=>content.gallery[(next+i-1+content.gallery.length)%content.gallery.length]);
 await Promise.all(items.map(decodeGalleryPhoto));
 const outgoing=[],animations=[];
 galleryFigures.forEach((figure,i)=>{
  const item=items[i],a=figure.querySelector('a'),image=figure.querySelector('img');
  if(!galleryMotion.matches&&figure.getClientRects().length){
   const previous=image.cloneNode();previous.className='gallery-image-outgoing';previous.alt='';previous.setAttribute('aria-hidden','true');previous.removeAttribute('loading');previous.style.objectPosition=getComputedStyle(image).objectPosition;previous.style.width='100%';previous.style.height='100%';a.append(previous);outgoing.push(previous);
  }
  a.href='/assets/'+item.file;a.dataset.gallery=item.id;a.setAttribute('aria-label','Ampliar: '+item.title);
  image.src=a.href;image.alt=item.alt;figure.querySelector('.eyebrow').textContent=item.category;figure.querySelector('.gallery-caption').textContent=item.title;
 });
 galleryIndex=next;
 $('#gallery-count').textContent=String(next+1).padStart(2,'0')+' / '+String(content.gallery.length).padStart(2,'0');
 if(galleryMotion.matches)return;
 try{
  for(const image of outgoing)animations.push(image.animate([{opacity:1},{opacity:0}],{duration:280,easing:'cubic-bezier(0.16, 1, 0.3, 1)',fill:'forwards'}));
  for(const figure of galleryFigures)if(figure.getClientRects().length)animations.push(figure.querySelector('figcaption').animate([{opacity:.35},{opacity:1}],{duration:280,easing:'cubic-bezier(0.16, 1, 0.3, 1)'}));
  await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
 }finally{outgoing.forEach(image=>image.remove());animations.forEach(animation=>animation.cancel());}
}
async function galleryStep(direction){
 galleryTarget=(galleryTarget+direction+content.gallery.length)%content.gallery.length;
 if(galleryChanging)return;
 galleryChanging=true;
 try{while(galleryTarget!==galleryIndex)await renderGallery(galleryTarget);}
 catch{galleryTarget=galleryIndex;$('#gallery-count').textContent='A foto não carregou. Tente novamente.';}
 finally{galleryChanging=false;}
}
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


// Native scrolling keeps all five photos available without JavaScript.
const bridal=$('.bridal-carousel');
if(bridal){
 const track=$('#bridal-track'),slides=[...track.querySelectorAll('.bridal-slide')],thumbnails=[...bridal.querySelectorAll('[data-bridal-photo]')],toggle=$('#bridal-toggle'),announcement=$('#bridal-status'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,playing=!motion.matches,visible=!('IntersectionObserver' in window),hovered=false,timer=null,scrollFrame=null;
 const canAdvance=()=>playing&&visible&&!hovered&&!document.hidden;
 function schedule(){clearTimeout(timer);if(!canAdvance())return;timer=setTimeout(async()=>{const next=(index+1)%slides.length;try{await slides[next].querySelector('img').decode();}catch{}if(canAdvance())go(next,false);},6000);}
 function render(){bridal.dataset.playing=String(playing);toggle.querySelector('span').textContent=playing?'Pausar':'Reproduzir';toggle.setAttribute('aria-label',playing?'Pausar carrossel':'Reproduzir carrossel');$('#bridal-count').textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');announcement.setAttribute('aria-live',playing?'off':'polite');announcement.textContent='Foto '+(index+1)+' de '+slides.length;thumbnails.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',String(i!==index)));schedule();}
 function pause(){playing=false;render();}
 function go(next,manual=true){const previous=index;if(manual)playing=false;index=(next+slides.length)%slides.length;track.scrollTo({left:index*track.clientWidth,behavior:motion.matches||Math.abs(index-previous)>1?'instant':'smooth'});render();}
 bridal.querySelector('.bridal-controls').hidden=false;bridal.querySelector('.bridal-thumbnails').hidden=false;
 $('#bridal-prev').addEventListener('click',()=>go(index-1));$('#bridal-next').addEventListener('click',()=>go(index+1));
 thumbnails.forEach(button=>button.addEventListener('click',()=>go(Number(button.dataset.bridalPhoto))));
 toggle.addEventListener('click',()=>{playing=!playing;render();});
 bridal.addEventListener('focusin',event=>{if(event.target!==toggle)pause();});
 track.addEventListener('pointerdown',pause,{passive:true});track.addEventListener('wheel',pause,{passive:true});
 bridal.addEventListener('pointerenter',event=>{if(event.pointerType!=='mouse')return;hovered=true;schedule();});
 bridal.addEventListener('pointerleave',()=>{hovered=false;schedule();});
 track.addEventListener('keydown',event=>{const key=event.key;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;event.preventDefault();go(key==='Home'?0:key==='End'?slides.length-1:index+(key==='ArrowRight'?1:-1));});
 track.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=null;const actual=Math.round(track.scrollLeft/track.clientWidth);if(actual>=0&&actual<slides.length&&actual!==index&&Math.abs(track.scrollLeft-actual*track.clientWidth)<2){index=actual;render();}});},{passive:true});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.35}).observe(track);
 if('IntersectionObserver' in window&&$('.floating-whatsapp'))new IntersectionObserver(entries=>{$('.floating-whatsapp').hidden=entries[0].isIntersecting;}).observe(bridal);
 if('ResizeObserver' in window)new ResizeObserver(()=>track.scrollTo({left:index*track.clientWidth,behavior:'instant'})).observe(track);
 document.addEventListener('visibilitychange',schedule);window.addEventListener('pagehide',()=>clearTimeout(timer));window.addEventListener('pageshow',schedule);
 motion.addEventListener('change',()=>{if(motion.matches)pause();});
 render();
}
