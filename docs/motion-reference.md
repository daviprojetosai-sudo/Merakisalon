# Levantamento de movimento
Fonte: HTML/CSS/JS de https://nelsonstudio.com.br/ consultados em 12/10/2026.
## Evidências identificadas
- Elementor 4.2.0; tema Phlox Pro 5.17.7; widgets Auxin 2.17.15.
- jQuery 3.7.1; Swiper CSS v8.4.5; Elementor Gallery 1.2.0; Masonry e imagesLoaded referenciados.
- Entradas: classes aux-appear-watch-animation, aux-fade-in, aux-fade-in-right-1 e aux-slide-from-bot. Direção inferior em títulos, fade e entrada da direita no botão de header.
- Hover: configurações _transform_scale_effect_hover com size 1.03 em containers de serviços.
- Header: aux-overlay-header e aux-top-sticky no documento; data-sticky-height=0. Mudanças visuais durante scroll não identificadas por execução.
- Galeria: estilos Swiper e Elementor Gallery presentes. Configuração efetiva de carrossel/lightbox não identificada.
## Não identificado
Duração, delay, easing exatos; reação dinâmica dos títulos do hero; menu mobile em uso; cursor customizado; preloader efetivo; parallax efetivo. Classe aux-parallax-section está presente, mas não prova deslocamento em execução.
GSAP, ScrollTrigger e Lenis não identificados nos scripts consultados. Não afirmar ausência definitiva.
## Implementação própria
Sem importar o código ou bibliotecas da referência.
- IntersectionObserver para entradas uma vez: translateY(20px) para 0 e opacity; 800ms; stagger 80ms; cubic-bezier(0.22,1,0.36,1).
- --motion-fast:200ms; --motion-base:400ms; --motion-slow:800ms.
- Hero e CTA visíveis desde o HTML, sem preloader ou espera por JS.
- Header fixado por position:sticky; sentinel a 40px para sombra.
- Imagens: scale(1.04) em 800ms somente em hover com pointer fine.
- Botões: elevação de 2px, feedback de pressão scale(.98), 200ms.
- Galeria: sem autoplay; controles explícitos, atualização acessível e dialog nativo com foco preso, Escape e restauração do foco.
- Menu mobile e FAQ usam details/summary e funcionam sem JS.
- prefers-reduced-motion desativa deslocamentos e transições; sem parallax, cursor especial ou bloqueio do scroll.
Valores não encontrados na referência são decisões próprias, não extrações.

