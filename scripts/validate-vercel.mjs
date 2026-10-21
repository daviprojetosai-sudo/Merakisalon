import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import worker from '../src/worker.js';
import {handleRequest} from '../src/vercel-handler.js';
import {assets} from '../.openai/local/assets.js';
import content from '../content.json' with {type:'json'};
import handler from '../.vercel/output/functions/index.func/index.mjs';

const config=JSON.parse(await readFile('.vercel/output/config.json','utf8'));
const functionConfig=JSON.parse(await readFile('.vercel/output/functions/index.func/.vc-config.json','utf8'));
assert.equal(config.version,3);assert.equal(functionConfig.runtime,'nodejs24.x');assert.equal(typeof handler,'function');
assert.equal(config.routes.find(route=>route.handle==='filesystem')?.handle,'filesystem');assert.equal(config.routes.at(-1).dest,'/index');
for(const [url,asset] of Object.entries(assets))assert.deepEqual(await readFile('.vercel/output/static'+url),Buffer.from(asset.data,'base64'),url);
const media=JSON.parse(await readFile('assets/space/media-manifest.json','utf8'));
for(const [name,expected] of Object.entries(media)){
 const bytes=await readFile('.vercel/output/static/media/'+name);
 assert.equal(bytes.length,expected.size);assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256,name);
}
const normalize=html=>html.replace(/nonce="[^"]+"/g,'nonce="verified"');
for(const pathname of ['/','/privacidade','/termos','/pagina-inexistente']){
 const request=new Request('https://meraki-preview.example'+pathname);
 const original=await worker.fetch(request,{SITE_URL:'https://meraki-preview.example',SPACE_GALLERY_READY:'true',SPACE_PHOTO_COUNT:String(content.spaceGallery.length)});
 const adapted=await handleRequest(request);
 assert.equal(adapted.status,original.status);
 assert.equal(normalize(await adapted.text()),normalize(await original.text()),pathname+' changed content');
}
async function walk(directory){const files=[];for(const entry of await readdir(directory,{withFileTypes:true})){const name=directory+'/'+entry.name;if(entry.isDirectory())files.push(...await walk(name));else files.push(name);}return files;}
const files=await walk('.vercel/output');assert(!files.some(name=>/\.(?:env|pem|key)$|original\.png|auth\.json|project\.json|hosting\.json/.test(name)));
console.log('Vercel validado: conteúdo idêntico, '+Object.keys(assets).length+' assets e '+Object.keys(media).length+' mídias com bytes íntegros; sem credenciais ou arquivos privados no pacote.');
