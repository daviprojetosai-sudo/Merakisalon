# Revisão do Meraki Salon — 15/10/2026

Revisão técnica, editorial e visual do site existente, com correções implementadas. A identidade visual e o conteúdo fotográfico aprovado foram preservados. O telefone oficial foi confirmado pelo responsável pelo projeto nesta conversa: **(54) 99932-1003**.

## Problemas encontrados e corrigidos

| Prioridade | Evidência anterior | Correção |
| --- | --- | --- |
| P1 | Links e mensagem preparada apontavam para o telefone provisório (54) 99169-3123. | Novo número em todos os links, mensagem do formulário e dados estruturados; `phoneVerified:true`. |
| P2 | Botão de envio pelo site aparecia sem CAPTCHA, provedor de e-mail e limitador distribuído configurados. O usuário só descobria a indisponibilidade depois de preencher. | A opção só é renderizada quando todas as configurações obrigatórias existem. WhatsApp continua como fluxo disponível. |
| P2 | Formulário sem JavaScript devolvia 503 em produção quando o limitador não estava configurado. | Redirecionamento validado e sem armazenamento para WhatsApp funciona independentemente dos provedores de e-mail. O envio de e-mail continua exigindo CAPTCHA e limitador. |
| P2 | Páginas de privacidade e termos solicitavam `/assets/client.js`, arquivo inexistente depois da adoção de nomes com hash. | Usam o mesmo manifesto de assets da página inicial. Menu e Escape funcionam nessas páginas. |
| P2 | Miniaturas do Espaço Noiva baixavam os mesmos originais grandes das fotos principais. Primeiro carrossel também baixava originais para a visualização menor. | Seis miniaturas dedicadas de 160 px e cinco previews de até 900 px; arquivos originais continuam disponíveis ao ampliar o primeiro carrossel. Fotos principais de noiva não foram reduzidas. |
| P2 | Favicon de 512 px/187 KB era baixado para um ícone pequeno. | Variantes de 32 e 180 px, com o fundo escuro aprovado. |
| P2 | WhatsApp flutuante podia encobrir a seta do primeiro carrossel e parte do formulário em celular. | Oculto enquanto essas áreas estão visíveis, além das galerias em que já era ocultado. |
| P3 | Seis miniaturas lado a lado tinham cerca de 41 px em telas de 320 px. | Duas linhas de três miniaturas abaixo de 360 px. |
| P3 | Erro pedia data futura, mas a validação aceita o dia atual. Observações rejeitavam quebras de linha. | Mensagem de data coerente e observações multilinha, mantendo rejeição de HTML e controles perigosos. |

Não foram encontrados erros ortográficos adicionais nos textos autorais revisados. Depoimentos foram mantidos como trechos da fonte, inclusive sua grafia original. Padronizada a referência ao Espaço Noiva.

## Responsividade, acessibilidade e design

Testes em Chrome com larguras de **320, 360, 390, 720, 768, 1024, 1440 e 1920 px**. Sem rolagem horizontal do documento. A largura de 720 px também cobre a composição equivalente a uma janela de 1440 px com zoom de 200%; não equivale a testar todos os recursos de ampliação de todos os navegadores.

Inspeção visual da hero, primeiro carrossel, serviços, retrato, galeria do espaço, Espaço Noiva, agendamento e contato em celular e desktop. Controles de botão/summary visíveis medidos com pelo menos 44 × 44 px. Paleta, fontes, enquadramentos e hierarquia aprovados foram mantidos.

Axe com regras WCAG 2 A/AA, 2.1 AA e 2.2 AA: **zero violações detectadas** na home em 390/1440 px, privacidade, termos e página 404. Isso não é certificação de conformidade. Navegação com teclado, Escape, foco de modais, retorno ao acionador e preferência por movimento reduzido também foram exercitados.

Fluxos: cinco categorias do primeiro carrossel; 19 fotos do espaço; seis fotos do Espaço Noiva; controles e pausa; menu mobile; perguntas frequentes; formulário inválido/válido; observações multilinha; novo WhatsApp; conteúdo e controles nativos sem JavaScript. O mapa é criado somente após clique; sua resposta externa foi simulada no teste para não depender do Google. Nenhuma mensagem real foi enviada ao salão.

## Desempenho medido

Lighthouse 13.5.0, Chrome local, configuração móvel padrão com simulação de rede/CPU e perfil desktop. Resultados de laboratório, sujeitos à variação de máquina/rede; não são dados de usuários reais nem medição da hospedagem de produção.

| Medida | Celular antes | Celular depois | Desktop depois |
| --- | --- | --- | --- |
| Desempenho | 82 | **91** | **99** |
| Acessibilidade | 100 | **100** | **100** |
| Boas práticas | 100 | **100** | **100** |
| SEO | 100 | **100** | **100** |
| LCP | 4,6 s | **3,4 s** | **0,8 s** |
| CLS | 0,023 | **0,023** | **0,001** |

Carga capturada na navegação móvel inicial: **1.105.611 → 458.437 bytes**, redução de aproximadamente **59%**. JavaScript inicial: cerca de **12,5 KB**; validação é carregada sob demanda. Fotos abaixo da dobra continuam com carregamento adiado. Fontes locais, metadados e preload da hero verificados.

O LCP móvel melhorou, mas ainda supera a referência de 2,5 s. Uma melhoria futura deve priorizar a hero em conexão lenta e medir usuários reais depois da abertura pública. Os originais das fotos ampliadas continuam grandes para preservar a qualidade solicitada. O build verifica o limite de 10 MiB comprimidos do Worker; novas fotos devem preferir o armazenamento de mídia existente.

## Segurança verificada

**21 testes automatizados passaram**, incluindo validação no servidor, campos extras, serviço/data/horário/telefone inválidos, controles/HTML, consentimento, CSRF, limite de corpo, honeypot, CAPTCHA inválido/hostname/ação divergentes, rate limit, falha de provedor sem vazamento de detalhes, redirecionamento do WhatsApp e autorização de mídia. Não há banco de dados de clientes ou confirmação automática de horários neste site.

Verificados CSP restritivo sem `unsafe-inline`/`unsafe-eval`, nonce por resposta, bloqueio de enquadramento, `nosniff`, HSTS, política de referência, escape de HTML e resposta sem cache para páginas/formulário. Rotas de upload permanecem desabilitadas em produção; quando habilitadas explicitamente, exigem segredo, nome permitido, tamanho e SHA-256 exatos. Nenhum segredo é necessário no navegador. Provedores de e-mail continuam com falha fechada quando não configurados.

`pnpm audit --prod`: **zero vulnerabilidades conhecidas**, cobrindo a única dependência de produção. Isso não significa ausência absoluta de vulnerabilidades. A análise de código e os testes locais não encontraram uma exploração crítica/alta nos caminhos exercitados.

**Limites:** Strix não estava instalado neste ambiente, portanto não foi executado um pentest autônomo completo. Serviços externos foram simulados nos testes de entrega; não foram atacados WhatsApp, Google, Cloudflare ou Resend. Não foi realizada certificação jurídica/LGPD. A política atual informa que o salão precisa confirmar canal de privacidade e retenção antes do lançamento público. A audiência privada existente foi preservada.

## Evidências e reprodução

- `node scripts/build.mjs`
- `node --test tests/*.test.mjs`
- `node scripts/check.mjs`
- `node scripts/validate-artifact.mjs`
- `node scripts/browser-qa.mjs` com preview em 4193; `QA_BASE_URL` permite outra URL local.
- Evidências locais ignoradas pelo Git: `qa/audit-before.json`, `qa/audit-after.json`, screenshots `qa/audit-after-*`, `qa/audit-lighthouse-before-mobile.json`, `qa/audit-lighthouse-after-mobile.json`, `qa/audit-lighthouse-after-desktop.json`, `qa/dependency-audit-prod.json`.

Referências técnicas: [validação de entrada OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [revisão segura de código OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html), [WCAG — reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
