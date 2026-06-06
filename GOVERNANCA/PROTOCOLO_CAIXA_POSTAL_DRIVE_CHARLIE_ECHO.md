# Protocolo Caixa Postal Drive - Charlie Echo

Classificacao: GOVERNANCA / PROTOCOLO / PUBLICO SANITIZADO  
Versao: v1.0  
Data: 2026-06-06

## Quando usar

Usar quando Charlie Echo precisar deixar recado para:

- Fundador;
- Charlie Fox;
- futura I.A autorizada;
- continuidade de trabalho;
- revisao humana;
- alerta de seguranca.

## Fluxo

1. Escutar o pedido.
2. Classificar o conteudo.
3. Separar publico, interno, sigiloso e cofre.
4. Gerar recado em Markdown.
5. Indicar destino: GitHub, Drive governado, revisao humana ou cofre.
6. Se for Drive, pedir gravacao por humano, Charlie Fox / Codex, conector ou backend autenticado.
7. Registrar versionamento quando houver impacto.

## Modelo de recado

```md
# Recado para [destinatario]

Classificacao:
Data:
Autor:
Destino sugerido:

## Contexto

## Pedido ou alerta

## Risco

## Proximo passo
```

## Regra de ouro

Se virar aula, pode ir ao publico.

Se exigir continuidade interna, pode ir ao Drive.

Se houver segredo, parar e chamar revisao humana.

Se for cofre, nao publicar.

