# RELATÓRIO — Download por link e limpeza da interface v2.3

## O que foi feito

- removidos os botões permanentes de download das áreas de resposta da IA Estudantes e da IA Profissional;
- mantidos os botões essenciais de interação, como falar, perguntar/consultar, copiar, ouvir e limpar;
- incluída micro-orientação visual explicando que trabalhos médios ou grandes devem ser entregues por link/pacote de download;
- atualizada a página de Álbum para evitar excesso de botões de baixar imagem, mantendo ação de abrir imagem;
- criada orientação operacional em `ORIENTACOES/REGRA_DOWNLOAD_POR_LINK_TAMANHO_MEDIO_CHARLIE_ECHO.md`;
- atualizado o prompt/backend da API para ensinar Charlie Echo a sugerir link/pacote quando o trabalho atingir tamanho médio ou grande;
- atualizadas rotas limpas das páginas afetadas.

## Arquivos principais alterados

- `ia-estudantes.html`
- `ia-profissional.html`
- `album.html`
- `ia-estudantes/index.html`
- `ia-profissional/index.html`
- `album/index.html`
- `assets/css/charlie-light.css`
- `functions/api/ia.js`
- `ORIENTACOES/REGRA_DOWNLOAD_POR_LINK_TAMANHO_MEDIO_CHARLIE_ECHO.md`

## Resultado esperado

A tela fica mais clean. A Charlie Echo aprende a não poluir a interface com botões permanentes e passa a oferecer download por link apenas quando o volume do trabalho justificar.
