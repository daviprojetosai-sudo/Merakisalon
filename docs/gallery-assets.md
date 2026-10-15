# Galeria principal

Fotos fornecidas pelo usuário em 15/10/2026: primeira imagem Maquiagem; segunda Noivas; terceira Cabelos. O estado inicial desktop segue essa ordem da esquerda para a direita; Noivas ocupa a foto central e o contador indica 02/03. Setas percorrem as três fotos e a ampliação mantém a foto completa. A imagem de Cabelos tem somente 206 × 206 pixels no anexo; não foi ampliada por IA nem recebeu detalhes inventados.

Todos os originais permanecem em assets/. As fotos são servidas em WebP sem perda, sem redimensionamento, filtros ou alteração de iluminação. Cada conversão foi verificada comparando todos os pixels RGBA decodificados com o PNG original, com igualdade exata. Para manter a publicação dentro do limite do Worker, a mesma conversão sem perda foi aplicada às cinco imagens do Espaço Noiva e ao retrato O Meraki, preservando aparência, resolução e enquadramento. Metadados .webp.json e qa/lossless-image-evidence.json registram a verificação.

## Melhoria solicitada em 15/10/2026

A foto de cabelos foi restaurada com o ImageGen integrado, de 206 × 206 para 1254 × 1254. Detalhes finos foram reconstruídos por IA; não se trata de recuperar o arquivo original de alta resolução. O original permanece preservado. O resultado está em assets/gallery-hair-restored.png, servido como gallery-hair-restored-v1.webp (conversão sem perda). Prompt e proveniência em assets/gallery-hair-restored-v1.webp.json. As demais fotos permanecem inalteradas.

A navegação agora decodifica as fotos antes da troca e dissolve a imagem anterior por 280 ms, mantendo enquadramento e altura. Cliques rápidos são acumulados sem misturar estados. Movimento reduzido usa troca direta.
