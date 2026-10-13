# Revisão Impeccable — Meraki Salon

Solicitação: adaptar as avaliações à referência de widget Google e revisar o restante do site. Data: 12/10/2026. Impeccable 4.3.1; a atualização de versão solicitada pelo usuário será feita em um turno posterior, conforme instrução do skill.

## Direção preservada

Site institucional em modo Persuade. Paleta marfim, dourado e marrom; Cormorant para títulos e Manrope para texto; composição editorial, fotografias ilustrativas identificadas e navegação direta. A referência nova rege a seção de avaliações, sem substituir a identidade do restante do site.

## Revisão independente

Avaliação A: leitura de fonte e inspeção desktop 1440 e mobile 390 por agente independente, antes do detector. Base: 23/32 nas heurísticas aplicáveis de Nielsen; eficiência especializada e documentação não aplicáveis à landing page. Pontos fortes: herói, serviços editoriais e clareza sobre confirmação do horário. Principais problemas: apresentação das avaliações divergente da referência, envio não configurado apresentado como disponível, fotografia repetida, informações auxiliares pequenas e extensão da jornada mobile.

| Ajuste | Resultado |
| --- | --- |
| Depoimentos em colunas | Carrossel com cartões brancos, cantos de 14px, avatares sobrepostos com iniciais, Google G, estrelas douradas e setas de 44px |
| Navegação do carrossel | Deslizamento, setas, teclado, Home/End; limites desabilitam os controles; sem reprodução automática |
| Fonte e veracidade | Mesmos três autores, trechos e estrelas; origem secundária continua explícita; sem fotos, datas ou selo de verificação inventados |
| Regra de tipografia nas avaliações | Seletores corrigidos; nomes em destaque e origem/atribuição subordinadas |
| Galeria inicial | Maquiagem, unhas e noiva em vez da repetição imediata do herói; quatro imagens continuam acessíveis pela navegação |
| Envio pelo site | Alternativa exibida somente quando CAPTCHA, envio e proteção contra abuso estão configurados; WhatsApp mantém o fluxo disponível |
| Detalhes compartilhados | Microtextos funcionais ampliados; setas principais em SVG; seleção de texto, caret e números da galeria alinhados ao sistema |
| Celular | Espaços repetidos dos serviços ajustados; atalho flutuante oculto perto das ações de avaliações e agendamento, sem permanecer focável |

## Limites

Fotografias reais e informações operacionais não foram alteradas. A referência usa fotos de perfis e selo azul; o site utiliza iniciais e não apresenta selo de verificação sem evidência. Fotos do site continuam ilustrativas. Nota e procedência dos depoimentos documentadas em reviews-sources.md.

## Verificação

Avaliação B independente: detector mecânico executado uma vez sobre a interface final, junto da rodada de evidência em navegador. Resultados complementados após a verificação.

Resultado final: detector executado uma vez, com um aviso para a imagem inicialmente vazia do lightbox (falso positivo confirmado: src/alt preenchidos antes da abertura, imagem carregada). A rodada de navegador cobriu seis larguras, console, imagens, setas, teclado, Home/End, toque real, motion reduzido e acesso sem JavaScript. O contraste 4,49:1 do texto sobre a superfície de noiva foi corrigido pelo token de texto secundário. A confirmação de contraste usa movimento reduzido para medir estados estáveis, evitando quadros intermediários das transições. Doze testes de agendamento e três estados de configuração do canal de envio passaram. CUA indisponível na sessão; inspeção feita em Chrome via Playwright. Não foram criados overlays nem servidores de detector; somente a prévia do site foi usada. Nenhuma foto de avaliador, data ou selo de verificação foi inventado.

Confirmação aprovada: zero violações de acessibilidade Axe e zero overflow nas seis larguras. Depoimentos disponíveis sem JavaScript; navegação nativa por teclado e deslizamento confirmada no celular e desktop.
