# Arquitetura e fases
Stack: HTML semântico/CSS/JavaScript, Zod compartilhado e Worker ESM empacotado por esbuild; evita um framework pesado em um site institucional e permite API segura.
## Mapa
/ — hero, inspirações, seis serviços, sobre, ocasiões, avaliações, agendamento, contato/mapa, FAQ, chamada final.
/privacidade — transparência de tratamento.
/termos — termos de uso.
/api/agendamento — POST validado.
/sitemap.xml e /robots.txt — gerados.
/assets/* — arquivos servidos localmente, sem CDN de fotos/fontes.
## Arquivos
content.json centraliza os dados, serviços, perguntas e textos principais.
src/page.js gera o HTML com escape de saída.
src/styles.css contém tokens e layout.
src/client.js cuida de lightbox, menu, galeria, formulário e mapa sob demanda.
src/schema.js valida dados no browser e servidor.
src/worker.js aplica headers, validação, rate limit e integrações.
scripts/build.mjs gera bundle Worker autossuficiente com assets e manifesto.
scripts/dev.mjs adapta Request/Response ao HTTP local de Node.
tests/booking.test.mjs testa contrato da API e fronteiras de segurança.
## Fases
1. Análise: referências e metadados consultados, limitações registradas.
2. Planejamento: estrutura acima; fotografias ilustrativas e contato direto.
3. Design system: paleta da imagem, duas fontes, grid, espaçamento 8px, raios retos; círculo somente em selos/controles.
4. Implementação: HTML renderizado no servidor, mobile-first e conteúdo legível sem JS.
5. Movimento: melhorias progressivas com observer e dialog nativo.
6. Backend: Zod, consentimento, honeypot, Origin, tamanho máximo, CAPTCHA e rate limit.
7. Qualidade: CSP sem unsafe-inline, fontes locais, imagens WebP, SEO, mapa sob demanda.
8. Verificação: lint de sintaxe, build, unitários, testes browser e Lighthouse; resultado em final-report.md.
9. Entrega: código completo, documentação, .env.example e publicação privada em Sites.
## Camadas
Header 20, botão flutuante 25, skip-link 50; dialog usa top-layer nativa.
## Escopo funcional
A opção WhatsApp apenas prepara mensagem revisável e não reserva horário. JS valida sem armazenar. Sem JS, API valida e redireciona; em produção precisa rate limit configurado, senão orienta botão direto.
Envio de e-mail somente com configuração completa; falha fechado se CAPTCHA, Redis ou provedor falhar. Nenhuma credencial real foi fornecida.

