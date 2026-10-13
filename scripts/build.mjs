import {build} from 'esbuild';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
await mkdir('.openai/local',{recursive:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const client=await build({entryPoints:['src/client.js'],outdir:'assets',bundle:true,minify:true,splitting:true,format:'esm',write:false,platform:'browser',target:'es2022',chunkNames:'chunk-[hash]'});
const assets={};
for(const output of client.outputFiles)assets['/assets/'+path.basename(output.path)]={data:Buffer.from(output.contents).toString('base64'),type:'text/javascript; charset=utf-8'};
const css=await readFile('src/styles.css','utf8');
for(const filename of ['hero.webp','hero-small.webp','makeup.webp','nails.webp','bridal.webp','cormorant.woff2','cormorant-italic.woff2','manrope.woff2','favicon.svg']){
 const bytes=await readFile('assets/'+filename);assets['/assets/'+filename]={data:bytes.toString('base64'),type:filename.endsWith('webp')?'image/webp':filename.endsWith('woff2')?'font/woff2':'image/svg+xml'};
}
assets['/assets/styles.css']={data:Buffer.from(css).toString('base64'),type:'text/css; charset=utf-8'};
await writeFile('.openai/local/assets.js','export const assets = '+JSON.stringify(assets)+';\n');
await build({entryPoints:['src/worker.js'],outfile:'dist/server/index.js',bundle:true,minify:true,platform:'browser',format:'esm',target:'es2022'});
await cp('.openai/hosting.json','dist/.openai/hosting.json');
const bytes=await readFile('dist/server/index.js');
console.log('Build concluído: '+(bytes.length/1024).toFixed(0)+' KB; SHA256 '+createHash('sha256').update(bytes).digest('hex'));
console.log('JS inicial: '+Math.round(assets['/assets/client.js'].data.length*3/4)+' bytes; validação sob demanda.');

