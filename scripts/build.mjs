import {build} from 'esbuild';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import path from 'node:path';
import content from '../content.json' with {type:'json'};
await mkdir('.openai/local',{recursive:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const client=await build({entryPoints:['src/client.js'],outdir:'assets',bundle:true,minify:true,splitting:true,format:'esm',write:false,platform:'browser',target:'es2022',entryNames:'[name]-[hash]',chunkNames:'chunk-[hash]'});
const assets={};
await writeFile('.openai/local/media-manifest.js','export const mediaManifest = '+await readFile('assets/space/media-manifest.json','utf8')+';\n');
for(const output of client.outputFiles)assets['/assets/'+path.basename(output.path)]={data:Buffer.from(output.contents).toString('base64'),type:'text/javascript; charset=utf-8'};
const css=await readFile('src/styles.css','utf8');
const clientOutput=client.outputFiles.find(output=>/^client-[^.]+\.js$/.test(path.basename(output.path)));
if(!clientOutput)throw Error('Client entrypoint missing');
const clientScript='/assets/'+path.basename(clientOutput.path),stylesheet='/assets/styles-'+createHash('sha256').update(css).digest('hex').slice(0,12)+'.css';
await writeFile('.openai/local/asset-manifest.js','export const clientScript = '+JSON.stringify(clientScript)+';\nexport const stylesheet = '+JSON.stringify(stylesheet)+';\n');
for(const filename of ['hero-meraki-2026.webp','hero-meraki-2026-small.webp','gallery-makeup.webp','gallery-bridal.webp','gallery-hair-restored-v2.webp','gallery-nails-v2.webp','gallery-brows-v1.webp','cormorant.woff2','cormorant-italic.woff2','manrope.woff2','meraki-favicon-dark-32-v1.png','meraki-favicon-dark-180-v1.png','meraki-woman.svg','about-portrait.lossless.webp',...Array.from({length:4},(_,i)=>'noiva-'+(i+1)+'-original.lossless.webp'),'noiva-5-expanded.lossless.webp','noiva-6-original.lossless.webp',...content.bridalGallery.map(photo=>photo.thumbnail),...content.gallery.map(photo=>photo.preview)]){
 const bytes=await readFile('assets/'+filename);assets['/assets/'+filename]={data:bytes.toString('base64'),type:filename.endsWith('webp')?'image/webp':filename.endsWith('woff2')?'font/woff2':filename.endsWith('png')?'image/png':'image/svg+xml'};
}
assets[stylesheet]={data:Buffer.from(css).toString('base64'),type:'text/css; charset=utf-8'};
await writeFile('.openai/local/assets.js','export const assets = '+JSON.stringify(assets)+';\n');
await build({entryPoints:['src/worker.js'],outfile:'dist/server/index.js',bundle:true,minify:true,platform:'browser',format:'esm',target:'es2022'});
await cp('.openai/hosting.json','dist/.openai/hosting.json');
const bytes=await readFile('dist/server/index.js');
const compressedBytes=gzipSync(bytes).length;
if(compressedBytes>=10*1024*1024)throw Error('Worker ultrapassou o limite de 10 MiB comprimidos. Mova novas fotos para o armazenamento de mídia.');
console.log('Build concluído: '+(bytes.length/1024).toFixed(0)+' KB; SHA256 '+createHash('sha256').update(bytes).digest('hex'));
console.log('Worker comprimido: '+compressedBytes+' bytes de '+(10*1024*1024)+'.');
console.log('JS inicial: '+Math.round(assets[clientScript].data.length*3/4)+' bytes; validação sob demanda.');

