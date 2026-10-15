# Galeria Nosso espaço

Seção após O Meraki, com 18 imagens do usuário. Todas as imagens completas são WebP sem perda nas dimensões originais; miniaturas de 600px usam qualidade 94. Fontes e originais estão em assets/space/provenance.json e assets/space/*-original.png. Clique abre a imagem inteira, com setas, teclado, swipe, Escape e retorno do foco. As imagens carregam sob demanda.

As fotos ficam no R2 do próprio Site, vinculadas como BUCKET, e são servidas no mesmo domínio em /media/. O código do Worker permanece abaixo do limite de tamanho. Os nomes incluem hash e têm cache imutável. O upload é restrito a arquivos previamente registrados, com tamanho e SHA-256 exatos e autorização por segredo temporário MEDIA_UPLOAD_TOKEN. Remover esse segredo encerra o acesso de escrita.

SPACE_GALLERY_READY=true exibe a seção depois de todas as fotos terem sido carregadas. Essa separação evita publicar imagens indisponíveis durante a preparação. scripts/upload-space-media.mjs recebe credenciais apenas por stdin oculto, sem argumentos ou arquivos de segredos. Não compartilhe tokens em logs.

Verificado: 18 fotos em desktop e mobile, ampliação, teclado, navegação circular e auditoria de acessibilidade sem violações na seção. Testes de mídia validam autenticação, rejeição de arquivos incorretos, integridade dos bytes, HEAD e cache condicional. Os testes do formulário permanecem aprovados.
