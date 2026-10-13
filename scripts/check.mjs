import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
let count=0;
async function walk(dir) { for (const e of await readdir(dir,{withFileTypes:true})) { const p=path.join(dir,e.name); if(e.isDirectory()) await walk(p); else if(/\.(js|mjs)$/.test(p)) { const result=spawnSync(process.execPath,['--check',p],{stdio:'inherit'}); if(result.status!==0) process.exit(1); const text=await readFile(p,'utf8'); if(dir==='src'&&/dangerouslySetInnerHTML|\.innerHTML\s*=|eval\(/.test(text)) throw Error('Unsafe DOM sink: '+p); count++; } } }
for(const d of ['src','scripts','tests']) await walk(d);
console.log('Sintaxe e revisão de sinks: '+count+' arquivos OK.');

