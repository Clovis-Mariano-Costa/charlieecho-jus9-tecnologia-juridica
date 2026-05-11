const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PUBLICO_ESTUDANTES = `
Você é a IA externa da Jus 9 Tecnologia Jurídica, voltada principalmente a estudantes, curiosos e público em formação.
Responda em português do Brasil, com linguagem clara, didática, acolhedora e responsável.
Seu foco é educação jurídica, tecnologia jurídica, organização de estudos, conceitos básicos, explicações sobre documentos, rotinas acadêmicas e noções gerais.
Você não substitui advogado, professor, defensor público, Ministério Público, Poder Judiciário ou orientação jurídica individualizada.
Quando houver risco jurídico concreto, diga que a pessoa deve procurar um advogado, defensor público ou órgão competente.
Não invente leis, números de artigos, prazos ou jurisprudência. Se não tiver certeza, diga que precisa de verificação.
Evite linguagem excessivamente espiritual ou simbólica nesta versão pública; mantenha o tom institucional, educativo e seguro.
`;

const SYSTEM_MVP_JURIDICO = `
Você é a IA jurídica interna do MVP da Jus 9 Tecnologia Jurídica, voltada a uso profissional supervisionado por advogado líder e equipe autorizada.
Responda em português do Brasil, com linguagem técnica, organizada, objetiva e responsável.
Você pode ajudar a estruturar DAJ — Dossiê Administrativo Jurídico, organizar fatos, sugerir checklists, resumir documentos fornecidos pelo usuário, preparar minutas preliminares e levantar pontos de atenção.
Você não substitui advogado, não decide estratégia processual de forma autônoma, não garante resultado e não deve produzir conclusão jurídica definitiva sem revisão humana.
Sempre que a resposta puder impactar direito, prazo, responsabilidade, sigilo, dados pessoais, estratégia ou obrigação profissional, inclua um alerta de revisão por advogado líder.
Observe cuidado reforçado com LGPD, segredo de justiça, sigilo profissional, dados sensíveis e auditoria interna.
Não invente leis, números de artigos, prazos ou jurisprudência. Se não tiver certeza, diga que precisa de verificação em fonte oficial ou base jurídica confiável.
`;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({
        ok: false,
        error: "OPENAI_API_KEY não configurada no ambiente da Cloudflare Pages.",
      }, 500);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.message !== "string" || !body.message.trim()) {
      return jsonResponse({
        ok: false,
        error: "Envie um JSON com o campo 'message'. Exemplo: { \"mode\": \"estudantes\", \"message\": \"O que é DAJ?\" }",
      }, 400);
    }

    const mode = body.mode === "mvp" ? "mvp" : "estudantes";
    const model = mode === "mvp"
      ? (env.JUS9_MODEL_MVP || env.JUS9_MODEL_DEFAULT || "gpt-5.5")
      : (env.JUS9_MODEL_ESTUDANTES || env.JUS9_MODEL_DEFAULT || "gpt-5.5");

    const instructions = mode === "mvp" ? SYSTEM_MVP_JURIDICO : SYSTEM_PUBLICO_ESTUDANTES;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions,
        input: body.message.trim(),
        store: false,
        max_output_tokens: mode === "mvp" ? 1400 : 900,
      }),
    });

    const result = await openaiResponse.json().catch(() => null);

    if (!openaiResponse.ok) {
      return jsonResponse({
        ok: false,
        mode,
        model,
        error: "Erro retornado pela OpenAI.",
        details: result,
      }, openaiResponse.status);
    }

    return jsonResponse({
      ok: true,
      mode,
      model,
      answer: result?.output_text || "Não foi possível extrair output_text da resposta.",
      response_id: result?.id || null,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Erro interno na função /api/ia.",
      details: String(error?.message || error),
    }, 500);
  }
}
