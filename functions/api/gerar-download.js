export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const content = String(body.content || '').trim();
  const title = String(body.title || 'charlie-echo-download').trim();
  const format = String(body.format || 'txt').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'txt';

  if (!content) {
    return Response.json({ error: 'Conteúdo vazio. Não há arquivo para gerar.' }, { status: 400 });
  }

  // Base preparada para a etapa futura com Cloudflare R2/KV.
  // Quando o binding de armazenamento estiver configurado, salvar o arquivo aqui
  // e devolver { downloadUrl } ao front-end.
  return Response.json({
    ok: false,
    pendingStorage: true,
    message: 'Rota preparada. Para gerar link real, configure Cloudflare R2/KV e o binding de armazenamento.',
    suggestedFilename: title.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() + '.' + format
  }, { status: 501 });
}
