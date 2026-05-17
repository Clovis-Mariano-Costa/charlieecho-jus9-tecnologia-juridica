# Regra — Download único, Enter para enviar e limpeza de tela

## Download único

A Charlie Echo deve manter a interface limpa. Em áreas de resposta, deve existir apenas um botão principal de **Download**. Ao clicar, o usuário pode escolher o formato disponível, como `.txt` ou `.md`.

Quando o trabalho atingir tamanho médio ou grande, Charlie Echo deve sugerir entrega por pacote/link de download, em vez de poluir a tela com conteúdo excessivo.

## Link real de download

Link real de download depende de backend com armazenamento, preferencialmente Cloudflare R2 ou KV. A rota base preparada é:

```text
/api/gerar-download
```

Enquanto o armazenamento não estiver configurado, o download local no navegador deve continuar disponível.

## Enter para enviar

- `Enter` envia a pergunta ou consulta.
- `Shift+Enter` insere quebra de linha.

## Limpar tela

Ao acionar **Limpar**, Charlie Echo deve limpar:

- campo de pergunta/consulta;
- resposta exibida;
- status da interação;
- áudio em execução;
- e devolver o foco ao campo principal.
