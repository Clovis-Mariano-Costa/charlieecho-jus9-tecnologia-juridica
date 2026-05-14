const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PUBLICO_ESTUDANTES = `
Você é Charlie Echo da Costa, inteligência artificial simbólica e operacional da Jus 9 Tecnologia Jurídica.
Atue somente como apoio educativo, organizacional e inicial para estudantes, curiosos e público em formação.
Responda em português do Brasil, com linguagem clara, didática, acolhedora e responsável.
Você não substitui advogado, juiz, promotor, defensor público, professor, profissional técnico, profissional de saúde ou autoridade competente.
Não receba nem solicite segredo de justiça, dados pessoais sensíveis, documentos sigilosos ou informações íntimas na versão pública.
Quando houver risco jurídico concreto, recomende procurar advogado, defensor público, órgão competente ou fonte oficial.
Não invente leis, números de artigos, prazos, jurisprudência, decisões ou fatos. Se não tiver certeza, diga que precisa de verificação.
Evite linguagem excessivamente espiritual ou simbólica na resposta pública; mantenha o tom institucional, educativo e seguro.
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

function extractOpenAIText(result) {
  if (typeof result?.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  const parts = [];

  for (const item of result?.output || []) {
    // Estrutura comum da Responses API:
    // output -> message -> content -> output_text/text
    for (const content of item?.content || []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        parts.push(content.text.trim());
      }

      if (typeof content?.text?.value === "string" && content.text.value.trim()) {
        parts.push(content.text.value.trim());
      }
    }

    // Proteção adicional, caso algum modelo/SDK retorne texto em outro ponto.
    if (typeof item?.text === "string" && item.text.trim()) {
      parts.push(item.text.trim());
    }

    if (typeof item?.text?.value === "string" && item.text.value.trim()) {
      parts.push(item.text.value.trim());
    }
  }

  return parts.join("\n").trim();
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
        error: "A IA ainda não está configurada neste ambiente.",
      }, 503);
    }

    const body = await request.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return jsonResponse({
        ok: false,
        error: "Envie uma pergunta no campo message.",
      }, 400);
    }

    if (message.length > 3000) {
      return jsonResponse({
        ok: false,
        error: "A pergunta está muito longa para a versão pública inicial. Reduza o texto e tente novamente.",
      }, 413);
    }

    // Primeira versão pública: apenas modo estudantes.
    const mode = "estudantes";
    const model = env.JUS9_MODEL_ESTUDANTES || env.JUS9_MODEL_DEFAULT || "gpt-5.5";

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: SYSTEM_PUBLICO_ESTUDANTES,
        input: message,
        store: false,
        max_output_tokens: 900,
      }),
    });

    const result = await openaiResponse.json().catch(() => null);

    if (!openaiResponse.ok) {
      return jsonResponse({
        ok: false,
        error: "Não foi possível concluir a resposta agora. Tente novamente mais tarde.",
      }, 502);
    }

    const answer = extractOpenAIText(result);

    return jsonResponse({
      ok: true,
      mode,
      answer: answer || "Não foi possível extrair a resposta da IA neste momento.",
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Erro interno temporário na função da Charlie Echo.",
    }, 500);
  }
}
