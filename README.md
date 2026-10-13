# Meraki Salon
Site editorial em português do Brasil, inspirado na imagem fornecida, com conteúdo público do @merakisalonbr. HTML/CSS/JavaScript semântico e API Worker ESM, sem framework de UI pesado.

## Rodar
Requer Node.js 24 ou superior e npm.
```sh
npm install
npm run dev
```
Abra http://localhost:4173. A prévia lê .env se presente e executa o build ao iniciar. Após editar arquivos, reinicie o servidor para recompilar. Não há watcher.

```sh
npm run lint
npm test
npm run build
npm run validate
npm audit
```
Build gera dist/server/index.js e dist/.openai/hosting.json; o Worker tem os assets embutidos e atende páginas, arquivos e API. Não hospede dist como HTML estático: o formulário sem JS exige servidor.

## Conteúdo editável
Edite content.json: nome, copy principal, serviços, valores, localização, redes, horários e perguntas. Não use dados inventados. Confirme phone e marque phoneVerified:true somente após validação com o salão. Troque fotografias ilustrativas por arquivos reais autorizados; mantenha dimensões e WebP e atualize scripts/build.mjs. Textos legais e labels de interface estão em src/page.js e src/client.js.
O wordmark é uma composição tipográfica provisória; substitua pelo logo oficial quando disponível.

## Agendamento
O fluxo principal valida no cliente e prepara uma mensagem que o visitante revisa e envia no WhatsApp. Não salva dados, não envia mensagem automaticamente e não reserva horário.
Sem JS, o formulário envia POST para a API e recebe redirecionamento validado ao WhatsApp. Produção requer Redis REST para limitar abuso nessa rota; na falta, o site orienta usar o botão direto de WhatsApp.
O fluxo opcional por e-mail possui validação Zod, Origin/CSRF, limite de payload, honeypot, rate limit distribuído e CAPTCHA Turnstile com verificação server-side, hostname e action.
Sem todas as configurações ele retorna 503 e oferece WhatsApp, sem declarar sucesso falso.

## Variáveis
Copie .env.example para .env e preencha somente no ambiente do servidor:
- TURNSTILE_SITE_KEY: chave pública de um widget autorizado para o hostname. Action usada: booking.
- TURNSTILE_SECRET_KEY: segredo do widget; nunca no cliente.
- RESEND_API_KEY: credencial de envio, não inclusa no projeto.
- BOOKING_FROM: remetente autorizado pelo Resend.
- BOOKING_TO: destinatário oficial do salão.
- RATE_LIMIT_URL: origem HTTPS do Redis REST compatível com Upstash; somente configuração do operador, nunca entrada do visitante.
- RATE_LIMIT_TOKEN: token privado Redis REST.
- PORT: 4173 por padrão.
Em hospedagem, configure runtime secrets pelo painel apropriado; .env não é empacotado. A URL canônica de Sites está em src/worker.js, ajuste-a ao mudar de domínio.

## Deploy
A versão de revisão usa Sites e acesso privado do proprietário. .openai/hosting.json guarda a identidade; não apague/recrie o site para atualizações.
Hospedagem tradicional: execute npm install, npm run build e npm start, atrás de proxy HTTPS. O adaptador local escuta loopback; use reverse proxy para acesso externo. Configure certificados e compressão no proxy. Em produção distribuída não use o limitador local: defina NODE_ENV=production nas variáveis do servidor e mantenha Redis REST configurado.
Vercel/Netlify: exigem adaptação da exportação fetch a uma Function de plataforma e roteamento de páginas/assets. O Worker não é um projeto Next.js e não deve ser enviado diretamente como exportação estática. Sites/Cloudflare Workers são o destino compatível direto.

## QA
npm run test:browser usa Chrome em C:/Program Files/Google/Chrome/Application/chrome.exe (ajuste scripts/browser-qa.mjs para seu sistema). Verifica os seis breakpoints, galeria, formulário, teclado, FAQ e reduced-motion/sem JS.
Lighthouse pode ser executado com:
```sh
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --output=json
```
Evidências locais em qa/; resumo permanente em docs/final-report.md.
Testes de CAPTCHA/Redis/Resend usam mocks; nenhum e-mail real é enviado.

## Antes do lançamento público
Confirme o WhatsApp (54) 99169-3123: aparece em cadastros públicos, mas não foi confirmado nos perfis oficiais. Confirme endereço/sala, horários e preços.
Configure CAPTCHA, Redis e envio caso queira habilitar solicitações por e-mail.
Substitua fotos ilustrativas por fotos autorizadas do salão, da equipe e dos trabalhos; publique somente depoimentos reais autorizados.
Valide as políticas com o responsável pelo salão e registre canal de privacidade e retenção real.
Veja docs/reference-analysis.md, docs/motion-reference.md, docs/security-review.md e docs/final-report.md.

