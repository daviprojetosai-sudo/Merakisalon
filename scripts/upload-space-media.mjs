import {readFile} from 'node:fs/promises';
process.stdin.setRawMode?.(true);process.stdin.setEncoding('utf8');process.stdin.resume();let input='';console.log('Ready for private media JSON (input hidden).');
const params=await new Promise(resolve=>process.stdin.on('data',chunk=>{input+=chunk;if(input.includes('\n')){process.stdin.pause();process.stdin.setRawMode?.(false);resolve(JSON.parse(input.trim()));}}));
const manifest=JSON.parse(await readFile('assets/space/media-manifest.json','utf8'));let count=0;
for(const [name,expected] of Object.entries(manifest)){
 const bytes=await readFile('assets/space/'+name);const response=await fetch(params.origin+'/api/media/'+name,{method:'PUT',headers:{'OAI-Sites-Authorization':params.siteToken,Authorization:'Bearer '+params.uploadToken,'Content-Type':'image/webp','Content-Length':String(bytes.length)},body:bytes,signal:AbortSignal.timeout(90000)});
 if(response.status!==201)throw Error('Media upload failed ('+response.status+'): '+(await response.text()).slice(0,120));
 const check=await fetch(params.origin+'/media/'+name,{headers:{'OAI-Sites-Authorization':params.siteToken},signal:AbortSignal.timeout(90000)});if(!check.ok)throw Error('Media read failed: '+check.status);const actual=Buffer.from(await check.arrayBuffer());const {createHash}=await import('node:crypto');if(createHash('sha256').update(actual).digest('hex')!==expected.sha256)throw Error('Media bytes differ');
 console.log('Verified image '+(++count)+' / '+Object.keys(manifest).length);
}
console.log('All media uploaded and verified.');
