# Revisão de interface
Skills: design-taste-frontend, princípios de emil-design-eng, acessibilidade e regras do prompt.
Design Read: site institucional para clientes de salão, estética editorial sofisticada e acolhedora. Dials: DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 3.
Paleta marfim e dourado, serifas e órbitas são autorizadas explicitamente pela imagem de referência. O site claro segue essa referência. Sem glassmorphism, partículas, cursor especial, marquês ou preloader.
| Before | After | Why |
| --- | --- | --- |
| Texto dourado #8b6e3e | #7e6237 | Aumentar contraste de labels e números pequenos |
| Dialog com uma única ação deixava Tab passar ao chrome do navegador | Retenção explícita Tab/Shift+Tab e retorno do foco | Navegação por teclado previsível |
| Namespace Zod incluía exports desnecessários | Imports nomeados dos quatro validadores | JS do cliente reduzido de 465770 para aproximadamente 6 KB iniciais, schema sob demanda |
| Conteúdo em reveal ao receber foco | :focus-within remove opacidade/deslocamento imediatamente | Foco não pode ficar invisível |
| Fontes TTF iniciais | Fontes locais WOFF2 com font-display swap | Menos bytes e texto disponível durante carregamento |
Detalhes: botões com pressão suave; hover só em pointer fine; modal e menu instantâneos por teclado; observer sem handlers contínuos de scroll; movimento reduzido respeitado.


Correção de ícones mobile: setas de navegação e asteriscos da logo, faixa de especialidades e serviços substituídos por SVG com currentColor. Mesmo desenho nas duas versões, com dimensões responsivas existentes. Conferidos logo, CTA, menu mobile, galeria e páginas legais em Chrome com viewport desktop e emulação de iPhone; sem símbolos Unicode de seta/asterisco no texto renderizado. Layout anterior preservado.
