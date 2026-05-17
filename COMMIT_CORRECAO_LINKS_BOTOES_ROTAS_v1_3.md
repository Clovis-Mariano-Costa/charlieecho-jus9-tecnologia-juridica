Summary:
Corrige todos os botões e rotas internas da Charlie Echo

Description:
- Substitui dependência de redirects por pastas reais com index.html para rotas limpas
- Atualiza links e botões internos para /ia-estudantes/, /familia/, /album/, /governanca/ e /ia-profissional/
- Mantém arquivos .html antigos para compatibilidade com links já publicados
- Remove regras de _redirects que poderiam causar loop em Cloudflare Pages
- Corrige JavaScript da IA Estudantes para ativar botões locais como Perguntar, Exemplos, Copiar, Ouvir e Simplificar
- Cria página pública prudente para Cofre / Área reservada sem expor conteúdo sensível
- Inclui tela de erro e relatório técnico para diagnóstico
