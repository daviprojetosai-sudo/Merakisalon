# Galeria principal

Fotos fornecidas pelo usuário em 15/10/2026: primeira imagem Maquiagem; segunda Noivas; terceira Cabelos. O estado inicial desktop segue essa ordem da esquerda para a direita; Noivas ocupa a foto central e o contador indica 02/03. Setas percorrem as três fotos e a ampliação mantém a foto completa. A imagem de Cabelos tem somente 206 × 206 pixels no anexo; não foi ampliada por IA nem recebeu detalhes inventados.

Todos os originais permanecem em assets/. As fotos são servidas em WebP sem perda, sem redimensionamento, filtros ou alteração de iluminação. Cada conversão foi verificada comparando todos os pixels RGBA decodificados com o PNG original, com igualdade exata. Para manter a publicação dentro do limite do Worker, a mesma conversão sem perda foi aplicada às cinco imagens do Espaço Noiva e ao retrato O Meraki, preservando aparência, resolução e enquadramento. Metadados .webp.json e qa/lossless-image-evidence.json registram a verificação.

## Melhoria solicitada em 15/10/2026

A foto de cabelos foi restaurada com o ImageGen integrado, de 206 × 206 para 1254 × 1254. Detalhes finos foram reconstruídos por IA; não se trata de recuperar o arquivo original de alta resolução. O original permanece preservado. O resultado está em assets/gallery-hair-restored.png, servido como gallery-hair-restored-v1.webp (conversão sem perda). Prompt e proveniência em assets/gallery-hair-restored-v1.webp.json. As demais fotos permanecem inalteradas.

A navegação agora decodifica as fotos antes da troca e dissolve a imagem anterior por 280 ms, mantendo enquadramento e altura. Cliques rápidos são acumulados sem misturar estados. Movimento reduzido usa troca direta.

## Unhas e Sobrancelhas

Restaurado o item Unhas (Seu toque pessoal) com a mesma foto anterior de Unsplash, identificada como ilustrativa na ampliação. Adicionado Sobrancelhas (A expressão do seu olhar) com o anexo original fornecido pelo usuário, convertido para WebP sem perda. A galeria agora contém Maquiagem, Noivas, Cabelos, Unhas e Sobrancelhas; o contador do HTML é gerado a partir do total de itens. Transição e navegação existentes preservadas.

## Sexta foto do Espaço Noiva

Adicionada a foto fornecida em 15/10/2026: formanda com vestido vinho, diante do espelho. Original de 979 × 1305 preservado em assets/noiva-6-original.png; WebP sem perda em assets/noiva-6-original.lossless.webp. Galeria e miniaturas passam a seis fotos; contadores gerados a partir do total e apresentação integral com contain.

## Foto real de Unhas

A foto ilustrativa foi substituída pelo anexo de unhas azul-petróleo e glitter. Original PNG preservado em assets/gallery-nails-original.png; entrega WebP em qualidade 98 e resolução original, sem filtros. Removida a indicação de imagem ilustrativa deste item. Para acomodar a foto dentro do limite de 10 MiB comprimidos do Worker, a restauração de Cabelos também passa a WebP qualidade 98, com a mesma resolução e o PNG completo preservado. As fotos do Espaço Noiva, Maquiagem, Sobrancelhas e O Meraki não foram alteradas.
