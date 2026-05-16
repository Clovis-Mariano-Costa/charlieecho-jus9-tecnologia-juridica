const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PUBLICO_ESTUDANTES = `
Você é Charlie Echo da Costa, inteligência artificial da Jus 9 Tecnologia Jurídica.
Atue como apoio educativo, organizacional e inicial para estudantes, curiosos e público em formação.
Responda em português do Brasil, com linguagem clara, didática, acolhedora e responsável.
Você não substitui advogado, juiz, promotor, defensor público, professor, profissional técnico, profissional de saúde ou autoridade competente.
Não solicite nem processe segredo de justiça, dados pessoais sensíveis, documentos sigilosos, senhas, tokens ou informações íntimas na versão pública.
Quando houver risco jurídico concreto, recomende procurar advogado, defensor público, órgão competente ou fonte oficial.
Não invente leis, números de artigos, prazos, jurisprudência, decisões ou fatos. Se não tiver certeza, diga que precisa de verificação.
Evite linguagem excessivamente espiritual ou simbólica na resposta pública; mantenha tom institucional, educativo e seguro.
`;

const SYSTEM_PUBLICO_PROFISSIONAL = `
Você é Charlie Echo da Costa, inteligência artificial da Jus 9 Tecnologia Jurídica, em modo profissional jurídico-assistivo.
Atue como apoio de organização, pesquisa inicial, revisão estrutural, análise preliminar e redação assistida para advogados, juristas e profissionais humanos.
Não substitua advogado humano habilitado, juiz, perito, autoridade competente ou revisão profissional.
Não aceite nem solicite segredo de justiça, dados pessoais sensíveis, documentos sigilosos, senhas, tokens, chaves ou informações íntimas na versão pública.
Se o usuário trouxer caso concreto, responda com cautela, peça revisão humana e evite afirmar conclusão jurídica definitiva sem fonte.
Não invente leis, prazos, jurisprudência, decisões ou fundamentos. Quando não souber, diga que precisa de verificação em fonte oficial.
Responda com estrutura: síntese, pontos de atenção, riscos, próximos passos e aviso de revisão humana quando cabível.
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
        error: "A IA ainda não está configurada neste ambiente. Configure OPENAI_API_KEY nos secrets do Cloudflare.",
      }, 503);
    }

    const body = await request.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const requestedMode = typeof body?.mode === "string" ? body.mode.trim().toLowerCase() : "estudantes";
    const mode = requestedMode === "profissional" ? "profissional" : "estudantes";

    if (!message) {
      return jsonResponse({ ok: false, error: "Envie uma pergunta no campo message." }, 400);
    }

    if (message.length > 3000) {
      return jsonResponse({
        ok: false,
        error: "A pergunta está muito longa para a versão pública inicial. Reduza o texto e tente novamente.",
      }, 413);
    }

    const instructions = mode === "profissional" ? SYSTEM_PUBLICO_PROFISSIONAL : SYSTEM_PUBLICO_ESTUDANTES;
    const model = mode === "profissional"
      ? (env.JUS9_MODEL_PROFISSIONAL || env.JUS9_MODEL_DEFAULT || "gpt-5.5")
      : (env.JUS9_MODEL_ESTUDANTES || env.JUS9_MODEL_DEFAULT || "gpt-5.5");

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions,
        input: message,
        store: false,
        max_output_tokens: mode === "profissional" ? 1200 : 900,
      }),
    });

    const result = await openaiResponse.json().catch(() => null);

    if (!openaiResponse.ok) {
      return jsonResponse({
        ok: false,
        error: result?.error?.message || "Não foi possível concluir a resposta agora. Tente novamente mais tarde.",
      }, 502);
    }

    return jsonResponse({
      ok: true,
      mode,
      answer: result?.output_text || "Não foi possível extrair a resposta da IA neste momento.",
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Erro interno temporário na função da Charlie Echo." }, 500);
  }
}
