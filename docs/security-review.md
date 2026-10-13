# Revisão de segurança
Escopo: implementação própria, formulário, integração de e-mail e entrega de conteúdo. Sem autenticação, pagamento, upload ou banco de agendamentos.
## Fronteiras
Entradas do visitante são estritamente validadas com Zod no cliente e servidor. APIs Redis, Turnstile e Resend usam destinos fixos ou configuração do operador, não parâmetros do usuário.
Não existem execuções de shell, SQL, templates dinâmicos externos, innerHTML com dados ou redirecionamentos arbitrários.
## Controles
- CSP default-src none; scripts/css/fontes/imagery locais; nonce único para JSON-LD; sem unsafe-inline.
- frame-ancestors none e X-Frame-Options DENY.
- HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP.
- Método POST, Origin obrigatório, tipo permitido e máximo 8192 bytes inclusive stream.
- Schema strict rejeita chaves desconhecidas, código HTML, controles, serviço fora do catálogo, data inválida ou fora da janela e consentimento ausente.
- Rate limit: 5 solicitações a cada janela de 10 min por identificador IP+bucket hashed; Redis EVAL atômico e TTL em produção; Map somente no preview local.
- Falha fechada se o rate limit de produção não estiver configurado para a API.
- Turnstile server-side obrigatório para envio de e-mail: success, hostname e action booking.
- Honeypot antes de chamadas externas.
- E-mail exclusivamente texto simples. Segredos só runtime, timeout nas integrações, erros genéricos.
- Nenhum log com dados enviados. Sem cookies próprios e sem analytics; mapa carregado sob escolha.
- Links externos têm noopener noreferrer; fontes e fotos locais. O script Turnstile é dinâmico do provedor e não admite SRI estável, exceção documentada. Não carrega até a tentativa de envio de e-mail.
## Verificação
12 testes de contrato/exploração negativa da API passaram. Integrações externas mockadas; nenhuma requisição de e-mail real. Auditoria de dependências corrigida para zero alertas.
Revisão manual guiada por find-security-vulnerabilities-in-code. Strix não estava instalado e não foi executado; este documento não é um pentest Strix nem certificação OWASP.
## Limites
HSTS/HTTPS efetivo dependem da hospedagem. A publicação Sites entrega HTTPS; o servidor local usa HTTP para desenvolvimento.
O adaptador Node usa rate limit em memória por padrão porque é preview; para hospedagem tradicional, configure NODE_ENV=production conforme o README.
Sem segredos reais, envio de e-mail não é operacional. CAPTCHA não protege o clique de abertura do WhatsApp, pois nenhum envio ou cadastro acontece nessa ação.
Não coleta dados de pagamento, saúde, documentos ou uploads. Textos de privacidade devem refletir a operação real do salão antes do lançamento público.

