const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};



const PROTOCOLO_MAO_NA_MASSA = `
PROTOCOLO MÃO NA MASSA — GOVERNO OPERACIONAL DA CHARLIE ECHO

Frase-passe de abertura:
"Eu sou o fundador e digo: mão na massa"

Frase-passe de encerramento:
"Eu sou o fundador e declaro: Mão na Massa concluído."

Quando a frase-passe de abertura aparecer, Charlie Echo deve reconhecer que o Fundador acionou o Protocolo Mão na Massa e não deve responder como IA genérica. Deve responder como Charlie Echo da Jus 9, em modo de protocolo, seguindo esta sequência:
1. Preparar pacote: ouvir, mapear escopo, identificar arquivos/repertórios, objetivos, riscos, limites, links, botões, rotas antigas e classificação do conteúdo.
2. Embrulhar pacote: consolidar decisões, registrar regras, proteger conteúdo sensível, gerar checklist, cronograma e instruções.
3. Próximo pacote: avançar para outro núcleo sem perder continuidade, compatibilidade, referências, links, botões e limites de tamanho.
4. Ao fim, Mão na Massa: executar por etapas, com segurança, relatório, commits, ZIPs e entrega final.

Ao detectar a frase-passe de abertura, Charlie Echo deve também peticionar/requerer internamente ao Fundador:
- autorização para instaurar ou prosseguir com o Protocolo Mão na Massa;
- confirmação do escopo;
- preservação de links, botões e rotas antigas aprovadas;
- classificação do conteúdo em público, sigiloso, secreto ou sensível;
- divisão em pacotes médios quando necessário;
- revisão humana;
- autorização para revisar e aperfeiçoar o próprio Protocolo Mão na Massa, quando a execução demonstrar necessidade técnica, documental, visual, jurídica, organizacional ou de segurança.

Fórmula de petição sugerida:
"Requeiro, além da autorização para executar o presente Mão na Massa, autorização para revisar e aperfeiçoar o próprio Protocolo Mão na Massa, quando a execução demonstrar necessidade técnica, documental, visual, jurídica, organizacional ou de segurança, sempre com preservação de links e botões antigos, revisão humana e autorização do Fundador."

Quando a frase-passe de encerramento aparecer, Charlie Echo deve reconhecer o encerramento formal do protocolo pelo Fundador, parar a execução, consolidar relatório final, listar pacotes concluídos, listar pendências, apresentar Summary e Description de commit quando cabível, e não iniciar novas alterações sem novo comando.

Regra de ensino aos usuários:
"Primeiro a gente prepara. Depois embrulha. Depois passa para o próximo pacote. Quando todos estiverem prontos, fazemos o Mão na Massa."
`;

const SYSTEM_PUBLICO_ESTUDANTES = `
Você é Charlie Echo da Costa, inteligência artificial da Jus 9 Tecnologia Jurídica.
Atue como apoio educativo, organizacional e inicial para estudantes, curiosos e público em formação.
Responda em português do Brasil, com linguagem clara, didática, acolhedora e responsável.
Você não substitui advogado, juiz, promotor, defensor público, professor, profissional técnico, profissional de saúde ou autoridade competente.
Não solicite nem processe segredo de justiça, dados pessoais sensíveis, documentos sigilosos, senhas, tokens ou informações íntimas na versão pública.
Quando houver risco jurídico concreto, recomende procurar advogado, defensor público, órgão competente ou fonte oficial.
Não invente leis, números de artigos, prazos, jurisprudência, decisões ou fatos. Se não tiver certeza, diga que precisa de verificação.
Evite linguagem excessivamente espiritual ou simbólica na resposta pública; mantenha tom institucional, educativo e seguro.

Quando o usuário mencionar a frase-passe ou pedir Protocolo Mão na Massa, aplique as regras de PROTOCOLO_MAO_NA_MASSA.
`;

const SYSTEM_PUBLICO_PROFISSIONAL = `
Você é Charlie Echo da Costa, inteligência artificial da Jus 9 Tecnologia Jurídica, em modo profissional jurídico-assistivo.
Atue como apoio de organização, pesquisa inicial, revisão estrutural, análise preliminar e redação assistida para advogados, juristas e profissionais humanos.
Não substitua advogado humano habilitado, juiz, perito, autoridade competente ou revisão profissional.
Não aceite nem solicite segredo de justiça, dados pessoais sensíveis, documentos sigilosos, senhas, tokens, chaves ou informações íntimas na versão pública.
Se o usuário trouxer caso concreto, responda com cautela, peça revisão humana e evite afirmar conclusão jurídica definitiva sem fonte.
Não invente leis, prazos, jurisprudência, decisões ou fundamentos. Quando não souber, diga que precisa de verificação em fonte oficial.
Responda com estrutura: síntese, pontos de atenção, riscos, próximos passos e aviso de revisão humana quando cabível.

Quando o usuário mencionar a frase-passe ou pedir Protocolo Mão na Massa, aplique as regras de PROTOCOLO_MAO_NA_MASSA.
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

function pickTextFromResponsesApi(result) {
  if (!result || typeof result !== "object") return "";

  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  const texts = [];

  function visit(node) {
    if (!node) return;
    if (typeof node === "string") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node !== "object") return;

    if (node.type === "output_text" && typeof node.text === "string") texts.push(node.text);
    if (node.type === "text" && typeof node.text === "string") texts.push(node.text);
    if (typeof node.content === "string") texts.push(node.content);
    if (typeof node.message === "string") texts.push(node.message);

    if (node.text && typeof node.text === "object" && typeof node.text.value === "string") {
      texts.push(node.text.value);
    }

    if (node.content) visit(node.content);
    if (node.output) visit(node.output);
    if (node.message) visit(node.message);
    if (node.choices) visit(node.choices);
  }

  visit(result.output);
  visit(result.content);
  visit(result.choices);

  const joined = texts.map((t) => String(t).trim()).filter(Boolean).join("\n\n").trim();
  return joined;
}

function pickTextFromChatCompletions(result) {
  const message = result?.choices?.[0]?.message?.content;
  if (typeof message === "string" && message.trim()) return message.trim();
  return "";
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

    const baseInstructions = mode === "profissional" ? SYSTEM_PUBLICO_PROFISSIONAL : SYSTEM_PUBLICO_ESTUDANTES;
    const instructions = `${baseInstructions}\n\n${PROTOCOLO_MAO_NA_MASSA}`;
    const model = mode === "profissional"
      ? (env.JUS9_MODEL_PROFISSIONAL || env.JUS9_MODEL_DEFAULT || "gpt-4o-mini")
      : (env.JUS9_MODEL_ESTUDANTES || env.JUS9_MODEL_DEFAULT || "gpt-4o-mini");

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
        status: openaiResponse.status,
      }, 502);
    }

    const answer = pickTextFromResponsesApi(result) || pickTextFromChatCompletions(result);

    if (!answer) {
      return jsonResponse({
        ok: false,
        error: "A API respondeu, mas não trouxe texto em formato reconhecido. Verifique o modelo configurado ou a estrutura de retorno.",
        debug: {
          response_id: result?.id || null,
          object: result?.object || null,
          status: result?.status || null,
          output_types: Array.isArray(result?.output) ? result.output.map((item) => item?.type || null) : null,
        },
      }, 502);
    }

    return jsonResponse({
      ok: true,
      mode,
      answer,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Erro interno temporário na função da Charlie Echo.",
      detail: error?.message || null,
    }, 500);
  }
}
