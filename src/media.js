import {mediaManifest} from '../.openai/local/media-manifest.js';
export async function media(request,env){
 const path=new URL(request.url).pathname,upload=path.startsWith('/api/media/'),name=path.slice(upload?11:7),expected=mediaManifest[name];
 if(!expected)return new Response('Imagem não encontrada.',{status:404});
 if(upload){
  if(!env.MEDIA_UPLOAD_TOKEN||request.headers.get('authorization')!=='Bearer '+env.MEDIA_UPLOAD_TOKEN)return new Response('Não encontrado.',{status:404});
  if(request.method!=='PUT')return new Response(null,{status:405,headers:{Allow:'PUT'}});
  if(!env.BUCKET)return new Response('Armazenamento indisponível.',{status:503});
  if(request.headers.get('content-type')!=='image/webp'||Number(request.headers.get('content-length'))!==expected.size)return new Response('Arquivo inválido.',{status:400});
  const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400});const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>expected.size){await reader.cancel();return new Response(null,{status:413});}chunks.push(value);}
  if(size!==expected.size)return new Response(null,{status:400});const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==expected.sha256)return new Response('Arquivo inválido.',{status:400});
  await env.BUCKET.put('space/'+name,bytes,{httpMetadata:{contentType:'image/webp'},customMetadata:{sha256:hash}});return new Response(null,{status:201,headers:{'Cache-Control':'no-store'}});
 }
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 if(!env.BUCKET)return new Response('Imagem indisponível.',{status:503});
 const object=await env.BUCKET.get('space/'+name);if(!object)return new Response('Imagem não encontrada.',{status:404});
 const headers={'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable',ETag:'"'+expected.sha256+'"'};
 if(request.headers.get('if-none-match')===headers.ETag)return new Response(null,{status:304,headers});
 return new Response(request.method==='HEAD'?null:object.body,{headers});
}
