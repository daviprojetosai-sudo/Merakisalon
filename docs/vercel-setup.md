# Meraki Salon — preparação local para Vercel

Atualizado em 15 de outubro de 2026. O responsável pediu para preparar somente localmente. Nenhum projeto ou deploy foi criado na Vercel, nenhum plano foi contratado e nenhum DNS ou controle de acesso foi alterado.

## Conta e ferramentas

- Vercel CLI **64.2.0** instalada no escopo do usuário em `C:\Users\davi1\AppData\Local\pnpm`; diretório adicionado ao PATH do usuário.
- Login da CLI verificado como **dvmoraes26**; workspace `dvmoraes26`, plano **Hobby**. A consulta de leitura ao workspace pela CLI foi bem-sucedida.
- Plugin Vercel e orientações já estavam disponíveis. Não foi instalado outro pacote de skills.
- MCP compartilhado `https://mcp.vercel.com` adicionado à configuração global do Codex em `C:\Users\davi1\.codex\config.toml`, preservando as demais entradas. OAuth concluído; `codex mcp list --json` mostra `enabled: true` e `auth_status: o_auth`.
- Busca de documentação e `list_teams` do conector já disponível responderam; este último retornou uma lista vazia. As ferramentas da nova conexão global podem exigir nova sessão para aparecer. Não foi feito teste de mutação no MCP.
- Não há `.vercel/project.json`: este diretório não foi vinculado a um projeto remoto.

## Configuração preparada

| Item | Valor |
| --- | --- |
| Tipo / framework | **Other** — HTML/CSS/JS próprio, esbuild e função Node.js |
| Instalação | `npm ci` |
| Build da Vercel | `npm run build:vercel` |
| Saída | `.vercel/output` — Build Output API v3 |
| Runtime | Node.js **24.x**, uma função, duração máxima de 30 s |
| Região proposta | `gru1` — São Paulo |
| Servidor local equivalente | `npm run dev:vercel` |
| Validar artefato | `npm run validate:vercel` |

`vercel.json` contém os parâmetros de build. O build original `npm run build` e o manifesto do Sites continuam disponíveis.

O adaptador usa as páginas, textos, CSS, fontes e scripts existentes. O HTML renderizado foi comparado com o servidor anterior, normalizando somente o nonce de segurança. Os metadados usam a origem do destino Vercel em vez do domínio anterior. Um `SITE_URL` opcional pode fixar a origem canônica de produção no futuro.

Os **35 assets** usados pelo site e os **38 arquivos de mídia** do Nosso Espaço são copiados para `.vercel/output/static`, sem recompressão. Todos tiveram seus bytes comparados; as mídias também tiveram SHA-256 conferido. Assim, a versão Vercel não precisa da credencial ou do binding de R2. Nenhuma chave, `.env`, imagem-fonte PNG ou arquivo de autenticação entra no pacote de saída.

Rotas estáticas são atendidas antes da função. A função mantém renderização das páginas, CSP com nonce, termos/privacidade, 404 e `/api/agendamento`. Upload de mídia fica fechado. O adaptador não herda `LOCAL_DEV`, `BUCKET` ou credenciais de upload. A função compilada tem aproximadamente **144 KB**.

## Variáveis

**Obrigatórias para o funcionamento atual pelo WhatsApp: nenhuma.** Não foram cadastradas variáveis remotas.

- `SITE_URL`: opcional, configuração sem segredo para a origem canônica; deixar ausente no preview.
- `VERCEL` / `VERCEL_URL`: variáveis automáticas da plataforma; não cadastrar manualmente.
- `PORT`: apenas para escolher a porta local.
- Somente para eventual envio por e-mail: `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `BOOKING_FROM`, `BOOKING_TO`, `RATE_LIMIT_URL`, `RATE_LIMIT_TOKEN`. Não são necessárias nem foram habilitadas nesta preparação.

O WhatsApp oficial permanece **(54) 99932-1003**. Com JavaScript, o formulário valida e prepara uma mensagem para o usuário revisar e enviar. Sem JavaScript, o POST é validado no servidor e responde com redirecionamento 303 para o mesmo WhatsApp. Isso não reserva horário automaticamente.

## Verificações concluídas

- Build original e build Vercel concluídos; artefato v3 e função Node importáveis.
- **25 testes automatizados passaram**, incluindo os novos limites entre Node/Vercel e o servidor existente.
- Páginas idênticas e bytes dos 73 arquivos públicos conferidos.
- HTTP local: home, privacidade e termos 200; página ausente 404; HEAD sem corpo.
- HTTP local: POST válido sem JavaScript redireciona ao WhatsApp correto; CSRF 403; JSON inválido 400; corpo acima de 8 KB 413; upload desabilitado 404.
- Navegador em **320, 360, 390, 720, 768, 1024, 1440 e 1920 px**: sem overflow horizontal, erros de execução ou arquivos quebrados detectados.
- Carrosséis (5 categorias, 19 fotos do espaço e 6 do Espaço Noiva), modais/teclado, menu mobile, FAQ e formulário verificados.
- Axe: zero violações detectadas nas páginas exercitadas, sem equivaler a certificação de acessibilidade.
- Evidências locais: `qa/vercel-http-report.json`, `qa/vercel-browser-report.json`, screenshots `qa/vercel-*`.

O teste HTTP e o navegador usam a função compilada do artefato com um servidor local de arquivos estáticos. **Não substituem uma execução hospedada no runtime/CDN da Vercel.** Não foram testados HTTPS remoto, proteção de deploy, build remoto, recebimento de mensagem pelo salão ou domínio `.vercel.app`. Nenhuma mensagem de teste foi enviada.

## O que falta antes de publicar

1. Escolher uma conta/plano que permita o uso comercial do salão. A conta atual é Hobby; não foi feito upgrade. A [documentação da Vercel](https://vercel.com/docs/plans/hobby) limita esse plano a uso pessoal e não comercial.
2. Quando autorizado, selecionar explicitamente o workspace correto e criar/vincular o projeto, sem sobrescrever projetos existentes.
3. Fazer apenas o preview, testar o runtime real, as rotas, imagens, HTTPS e controles. Se houver Vercel Authentication, informar o responsável antes de alterar proteção.
4. Verificar manualmente o recebimento de uma mensagem autorizada no WhatsApp.
5. Publicar produção somente após aprovação expressa do preview. Verificar acesso sem login em sessão anônima.

URLs Vercel de preview e produção: **ainda inexistentes**. Domínio próprio e registros DNS: **nenhum**. A publicação atual no Sites permanece como estava.

Referências: [guia oficial de configuração](https://vercel.com/get-started.md), [Build Output API](https://vercel.com/docs/build-output-api), [primitivas de funções](https://vercel.com/docs/build-output-api/primitives).
