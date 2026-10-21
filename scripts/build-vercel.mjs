import {build} from 'esbuild';
import {mkdir,readFile,writeFile,copyFile,rm,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Reuse the exact client build and asset manifest of the existing site.
await import('./build.mjs');
const {assets}=await import('../.openai/local/assets.js');
const checkout=await realpath('.'),root=path.resolve(checkout,'.vercel/output'),staticRoot=path.join(root,'static'),functionRoot=path.join(root,'functions/index.func');
if(root!==path.join(checkout,'.vercel','output')||!root.startsWith(checkout+path.sep))throw Error('Output must stay inside the project');
for(const directory of [path.dirname(root),root]){try{if((await lstat(directory)).isSymbolicLink())throw Error('Generated output cannot use symlinks');}catch(error){if(error.code!=='ENOENT')throw error;}}
// Rebuild only this verified generated directory; project linking stays outside it.
await rm(root,{recursive:true,force:true});
await mkdir(functionRoot,{recursive:true});await mkdir(staticRoot,{recursive:true});
for(const [url,asset] of Object.entries(assets)){
 if(!/^\/assets\/[a-zA-Z0-9._-]+$/.test(url))throw Error('Invalid asset path');
 const destination=path.join(staticRoot,url.slice(1));await mkdir(path.dirname(destination),{recursive:true});
 await writeFile(destination,Buffer.from(asset.data,'base64'));
}
const mediaManifest=JSON.parse(await readFile('assets/space/media-manifest.json','utf8'));
await mkdir(path.join(staticRoot,'media'),{recursive:true});
for(const [name,expected] of Object.entries(mediaManifest)){
 if(!/^space-[a-z0-9-]+\.webp$/.test(name))throw Error('Invalid media path');
 const source=path.join('assets/space',name),bytes=await readFile(source);
 if(bytes.length!==expected.size||createHash('sha256').update(bytes).digest('hex')!==expected.sha256)throw Error('Media integrity check failed: '+name);
 await copyFile(source,path.join(staticRoot,'media',name));
}
await build({entryPoints:['src/vercel-handler.js'],outfile:path.join(functionRoot,'index.mjs'),bundle:true,minify:true,platform:'node',format:'esm',target:'node24',plugins:[{
 name:'cdn-assets',setup(builder){builder.onLoad({filter:/[\\/]\.openai[\\/]local[\\/]assets\.js$/},()=>({contents:'export const assets = {};',loader:'js'}));}
}]});
await writeFile(path.join(functionRoot,'.vc-config.json'),JSON.stringify({runtime:'nodejs24.x',handler:'index.mjs',launcherType:'Nodejs',shouldAddHelpers:false,maxDuration:30},null,2)+'\n');
await writeFile(path.join(root,'config.json'),JSON.stringify({version:3,routes:[
 {src:'/assets/(.*)',headers:{'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'},continue:true},
 {src:'/media/(.*)',headers:{'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'},continue:true},
 {handle:'filesystem'},
 {src:'/.*',dest:'/index'}
]},null,2)+'\n');
console.log('Vercel: '+Object.keys(assets).length+' assets, '+Object.keys(mediaManifest).length+' mídias verificadas e uma função Node.js em '+root);
