# Arquivos de interface versionados

JavaScript e CSS recebem nomes derivados do seu conteúdo durante o build. A página HTML referencia somente os nomes do mesmo build por meio de .openai/local/asset-manifest.js, também gerado antes do bundle do servidor.

Quando as fotos ou os dados de content.json mudam, o bundle JavaScript muda e recebe uma nova URL. O navegador pode manter arquivos antigos no cache, mas o HTML atual nunca os solicita. Os chunks dinâmicos também usam nomes com hash. Isso impede que um script antigo reponha as fotos anteriores ao navegar no carrossel.

Verificação: um navegador com o script antigo em cache reproduziu a falha (a seta carregou makeup.webp e voltou ao contador de quatro fotos). No mesmo navegador, após carregar a página com os arquivos versionados, doze avanços/retornos por viewport mantiveram apenas as três imagens novas. Cenário confirmado em desktop e mobile, incluindo a ampliação da foto.
