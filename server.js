import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const SERVICE_NAME = "WhatsApp Charlie Echo da Costa";
const COMPANY_NAME = "Jus 9 Tecnologia Jur\u00eddica";
const DEFAULT_GRAPH_API_VERSION = "v20.0";
const SOCIAL_LISTENING_REPEAT_THRESHOLD = 3;
const EMERGENCY_CONTACTS_REVIEWED_AT = "2026-06-12";
const EMERGENCY_CONTACTS_SOURCE_URLS = Object.freeze([
  "https://www.ssp.df.gov.br/emergencia-190-193-e-199",
  "https://cvv.org.br/",
  "https://www.gov.br/mulheres/pt-br/ligue180",
  "https://www.gov.br/pt-br/servicos/denunciar-violacao-de-direitos-humanos"
]);
const IMMEDIATE_EMERGENCY_CONTACTS_BR = Object.freeze([
  "190 (Pol\u00edcia Militar)",
  "192 (SAMU)",
  "193 (Bombeiros)"
]);
const SOCIAL_SUPPORT_CONTACTS_BR = Object.freeze([
  "188 (CVV, apoio emocional)",
  "180 (Central de Atendimento \u00e0 Mulher)",
  "100 (Disque Direitos Humanos)"
]);
const TRIAGE_MENU_REPLY = [
  "Ol\u00e1. Aqui \u00e9 o atendimento oficial da Jus 9 Tecnologia Jur\u00eddica.",
  "Eu sou Charlie Echo da Costa, I.A generativa multimodal jur\u00eddico-orientada, com governan\u00e7a humana.",
  "",
  "Para iniciar a triagem, responda com uma op\u00e7\u00e3o:",
  "1 - Urg\u00eancia, prazo ou audi\u00eancia",
  "2 - Documento, processo ou contrato",
  "3 - D\u00favida geral ou primeiro atendimento",
  "4 - Falar com atendimento humano",
  "",
  "N\u00e3o envie senhas, tokens, c\u00f3digos de acesso ou documentos sens\u00edveis por aqui. Esta triagem n\u00e3o substitui an\u00e1lise humana qualificada."
].join("\n");
const TRIAGE_SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const triageSessions = new Map();
const DEFAULT_DRIVE_SAVER_CLASSIFICATION = "JURIDICO_SIGILOSO";
const DRIVE_SAVER_ALLOWED_CLASSIFICATIONS = new Set([
  "JURIDICO_SIGILOSO",
  "COFRE_DEPOSITO_ASSISTIDO"
]);

export const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: SERVICE_NAME,
    company: COMPANY_NAME
  });
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = process.env.VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && typeof challenge === "string") {
    console.log("Webhook verificado com sucesso.");
    return res.status(200).send(challenge);
  }

  console.warn("Falha na verificacao do webhook.", {
    mode,
    hasVerifyToken: Boolean(token),
    hasConfiguredVerifyToken: Boolean(verifyToken)
  });
  return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  res.sendStatus(200);

  queueMicrotask(() => {
    processWebhookPayload(req.body).catch((error) => {
      console.error("Erro ao processar webhook.", {
        message: error?.message || String(error)
      });
    });
  });
});

export async function processWebhookPayload(payload) {
  const messages = extractIncomingMessages(payload);

  if (messages.length === 0) {
    console.log("Evento recebido sem mensagem de usuario.");
    return;
  }

  for (const message of messages) {
    console.log("Mensagem recebida.", {
      from: maskWhatsAppId(message.from),
      type: message.type,
      hasText: Boolean(message.text)
    });

    await handleIncomingMessage(message);
  }
}

export function extractIncomingMessages(payload) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  const messages = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];

    for (const change of changes) {
      const incomingMessages = Array.isArray(change?.value?.messages)
        ? change.value.messages
        : [];

      for (const message of incomingMessages) {
        if (!message?.from) continue;

        messages.push({
          from: String(message.from),
          id: message.id || null,
          timestamp: message.timestamp || null,
          type: message.type || "unknown",
          text: typeof message.text?.body === "string" ? message.text.body : "",
          rawMessage: message
        });
      }
    }
  }

  return messages;
}

export async function handleIncomingMessage({ from, text }) {
  const normalizedText = String(text || "").trim();
  const currentSession = getTriageSession(from);
  const triage = buildGovernedTriageReply(normalizedText, currentSession);
  setTriageSession(from, triage.nextSession);

  await sendWhatsAppTextMessage(from, triage.reply);
  await saveWhatsAppTriageProtocol({ from, text: normalizedText, triage });

  console.log("Charlie Echo processou mensagem.", {
    from: maskWhatsAppId(from),
    hasOriginalText: Boolean(normalizedText),
    triageIntent: triage.intent,
    triageStage: triage.nextSession?.stage || null
  });
}

export function buildGovernedTriageReply(text, session = null) {
  const normalized = normalizeForTriage(text);
  const intent = inferTriageIntent(text);

  if (isNewAttendanceCommand(normalized)) {
    return {
      intent: "new_attendance",
      nextSession: {
        intent: "menu",
        stage: "menu",
        postHandoffPressureCount: 0,
        socialListeningOffered: false,
        socialTurns: 0
      },
      reply: buildNewAttendanceReply()
    };
  }

  if (session?.stage === "social_listening") {
    const resolvedIntent = mergeTriageIntent(session.intent, intent);
    const hasSocialRisk = isImmediateDangerSignal(normalized) || isSocialNotSafeResponse(normalized);

    if (isSocialListeningNo(normalized)) {
      return {
        intent: "social_listening_closed",
        nextSession: {
          intent: resolvedIntent,
          stage: "ready_for_handoff",
          postHandoffPressureCount: getPostHandoffPressureCount(session),
          socialListeningOffered: true,
          socialTurns: getSocialListeningTurns(session)
        },
        reply: buildSocialListeningClosedReply(resolvedIntent)
      };
    }

    return {
      intent: hasSocialRisk ? "social_listening_risk" : "social_listening_reply",
      nextSession: buildSocialListeningSession(resolvedIntent, session, {
        incrementTurn: true
      }),
      shouldSaveProtocol: hasSocialRisk,
      protocolClassification: getDriveSaverProtocolClassification(),
      reply: hasSocialRisk
        ? buildSocialListeningRiskReply(resolvedIntent)
        : buildSocialListeningReply(resolvedIntent, normalized, session)
    };
  }

  if (session?.stage === "ready_for_handoff") {
    const resolvedIntent = mergeTriageIntent(session.intent, intent);
    const currentPressureCount = getPostHandoffPressureCount(session);
    const buildReadySession = ({ incrementPressure = false, socialListeningOffered = false } = {}) => ({
      intent: resolvedIntent,
      stage: "ready_for_handoff",
      postHandoffPressureCount: incrementPressure ? currentPressureCount + 1 : currentPressureCount,
      socialListeningOffered: Boolean(session.socialListeningOffered || socialListeningOffered),
      socialTurns: getSocialListeningTurns(session)
    });
    const shouldOfferSocialListening = (nextPressureCount) =>
      nextPressureCount >= SOCIAL_LISTENING_REPEAT_THRESHOLD && !session.socialListeningOffered;

    if (isContinuityQuestion(normalized)) {
      return {
        intent: "continuity",
        nextSession: buildReadySession(),
        reply: buildContinuityReply(resolvedIntent)
      };
    }

    if (isSocialListeningRequest(normalized)) {
      return {
        intent: "social_listening_offer",
        nextSession: buildSocialListeningSession(resolvedIntent, session, {
          incrementPressure: true
        }),
        shouldSaveProtocol: true,
        protocolClassification: getDriveSaverProtocolClassification(),
        reply: buildSocialListeningOfferReply(resolvedIntent)
      };
    }

    if (isImmediateDangerSignal(normalized)) {
      const nextPressureCount = currentPressureCount + 1;

      if (shouldOfferSocialListening(nextPressureCount)) {
        return {
          intent: "social_listening_offer",
          nextSession: buildSocialListeningSession(resolvedIntent, session, {
            incrementPressure: true
          }),
          shouldSaveProtocol: true,
          protocolClassification: getDriveSaverProtocolClassification(),
          reply: buildSocialListeningOfferReply(resolvedIntent)
        };
      }

      return {
        intent: "immediate_danger",
        nextSession: buildReadySession({ incrementPressure: true }),
        shouldSaveProtocol: true,
        protocolClassification: getDriveSaverProtocolClassification(),
        reply: buildImmediateDangerReply(resolvedIntent)
      };
    }

    if (isImmediateAttentionRequest(normalized) || isReturnExpectationQuestion(normalized)) {
      const nextPressureCount = currentPressureCount + 1;

      if (shouldOfferSocialListening(nextPressureCount)) {
        return {
          intent: "social_listening_offer",
          nextSession: buildSocialListeningSession(resolvedIntent, session, {
            incrementPressure: true
          }),
          shouldSaveProtocol: true,
          protocolClassification: getDriveSaverProtocolClassification(),
          reply: buildSocialListeningOfferReply(resolvedIntent)
        };
      }

      return {
        intent: "human_return_expectation",
        nextSession: buildReadySession({ incrementPressure: true }),
        shouldSaveProtocol: true,
        protocolClassification: getDriveSaverProtocolClassification(),
        reply: buildHumanReturnExpectationReply(resolvedIntent)
      };
    }

    if (isAnxiousFollowUp(normalized) || intent === "human") {
      const nextPressureCount = currentPressureCount + 1;

      if (shouldOfferSocialListening(nextPressureCount)) {
        return {
          intent: "social_listening_offer",
          nextSession: buildSocialListeningSession(resolvedIntent, session, {
            incrementPressure: true
          }),
          shouldSaveProtocol: true,
          protocolClassification: getDriveSaverProtocolClassification(),
          reply: buildSocialListeningOfferReply(resolvedIntent)
        };
      }

      return {
        intent: "comfort_next_steps",
        nextSession: buildReadySession({ incrementPressure: true }),
        reply: buildComfortNextStepsReply(resolvedIntent)
      };
    }

    if (isMeaningfulFollowUp(normalized)) {
      const nextPressureCount = currentPressureCount + 1;

      if (shouldOfferSocialListening(nextPressureCount)) {
        return {
          intent: "social_listening_offer",
          nextSession: buildSocialListeningSession(resolvedIntent, session, {
            incrementPressure: true
          }),
          shouldSaveProtocol: true,
          protocolClassification: getDriveSaverProtocolClassification(),
          reply: buildSocialListeningOfferReply(resolvedIntent)
        };
      }

      return {
        intent: "handoff_update",
        nextSession: buildReadySession({ incrementPressure: true }),
        shouldSaveProtocol: true,
        protocolClassification: getDriveSaverProtocolClassification(),
        reply: buildUpdateReceivedReply(resolvedIntent)
      };
    }

    return {
      intent: "handoff_status",
      nextSession: buildReadySession(),
      reply: buildContinuityReply(resolvedIntent)
    };
  }

  if (isStructuredTriageDetails(text, session)) {
    const resolvedIntent = mergeTriageIntent(session?.intent, intent);
    const hasImmediateDanger = isImmediateDangerSignal(normalized);

    return {
      intent: hasImmediateDanger ? "details_received_high_risk" : "details_received",
      nextSession: {
        intent: resolvedIntent,
        stage: "ready_for_handoff"
      },
      shouldSaveProtocol: true,
      protocolClassification: getDriveSaverProtocolClassification(),
      reply: hasImmediateDanger
        ? buildHighRiskDetailsReceivedReply(resolvedIntent)
        : buildDetailsReceivedReply(resolvedIntent)
    };
  }

  if (isImmediateDangerSignal(normalized)) {
    const resolvedIntent = mergeTriageIntent(session?.intent, "urgent");

    return {
      intent: "immediate_danger",
      nextSession: {
        intent: resolvedIntent,
        stage: "ready_for_handoff"
      },
      shouldSaveProtocol: true,
      protocolClassification: getDriveSaverProtocolClassification(),
      reply: buildImmediateDangerReply(resolvedIntent)
    };
  }

  if (isPressedFirstContact(normalized)) {
    const resolvedIntent = mergeTriageIntent(session?.intent, intent);

    return {
      intent: "pressed_triage_start",
      nextSession: {
        intent: resolvedIntent,
        stage: "awaiting_details"
      },
      reply: buildPressedTriageStartReply(resolvedIntent)
    };
  }

  if (isBareOption(normalized) && session?.stage === "awaiting_details" && session?.intent === intent) {
    return {
      intent,
      nextSession: {
        intent,
        stage: "awaiting_details"
      },
      reply: buildAlreadySelectedReply(intent)
    };
  }

  if (intent === "inheritance") {
    return {
      intent,
      nextSession: {
        intent,
        stage: "awaiting_details"
      },
      reply: [
        "Sinto muito pela perda do seu pai.",
        "Pelo que voc\u00ea descreveu, isso parece uma triagem de invent\u00e1rio, heran\u00e7a ou verifica\u00e7\u00e3o de bens.",
        "",
        "N\u00e3o precisa resolver tudo nesta mensagem. Vamos organizar o primeiro passo com calma.",
        "",
        "Para encaminhar com governan\u00e7a humana, responda em uma \u00fanica mensagem:",
        "1. seu nome e melhor contato;",
        "2. cidade/UF;",
        "3. se j\u00e1 existe invent\u00e1rio, processo ou documento;",
        "4. se h\u00e1 prazo, conflito familiar ou urg\u00eancia.",
        "",
        "N\u00e3o envie documentos completos agora. A Charlie Echo organiza a triagem; a an\u00e1lise jur\u00eddica precisa de revis\u00e3o humana qualificada."
      ].join("\n")
    };
  }

  if (intent === "urgent") {
    return {
      intent,
      nextSession: {
        intent,
        stage: "awaiting_details"
      },
      reply: [
        "Entendi que pode haver urg\u00eancia, prazo ou audi\u00eancia.",
        "Para a triagem humana, responda somente com:",
        "1. nome ou forma de contato;",
        "2. cidade/UF;",
        "3. tipo de prazo ou ato;",
        "4. data limite, se houver.",
        "",
        "Se houver risco imediato, perda de prazo hoje ou situa\u00e7\u00e3o sens\u00edvel, procure atendimento humano qualificado agora. Eu n\u00e3o tomo decis\u00e3o jur\u00eddica final."
      ].join("\n")
    };
  }

  if (intent === "document") {
    return {
      intent,
      nextSession: {
        intent,
        stage: "awaiting_details"
      },
      reply: [
        "Recebi sinal de assunto com documento, processo ou contrato.",
        "Para manter a governan\u00e7a, envie primeiro apenas uma descri\u00e7\u00e3o geral do caso, sem dados sens\u00edveis.",
        "Informe: tipo de documento, objetivo, prazo aproximado e se j\u00e1 existe profissional humano acompanhando.",
        "",
        "Documentos completos devem passar por revis\u00e3o humana e ambiente adequado antes de qualquer an\u00e1lise."
      ].join("\n")
    };
  }

  if (intent === "human") {
    return {
      intent,
      nextSession: {
        intent,
        stage: "awaiting_details"
      },
      reply: [
        "Certo. Vou tratar como pedido de atendimento humano.",
        "Eu posso acolher e organizar a triagem por aqui; a decis\u00e3o e o atendimento sens\u00edvel ficam com uma pessoa respons\u00e1vel.",
        "Para encaminhar melhor, responda com nome, melhor hor\u00e1rio de retorno e resumo breve do assunto.",
        "",
        "A Charlie Echo organiza a triagem, mas decis\u00f5es jur\u00eddicas sens\u00edveis dependem de revis\u00e3o humana qualificada."
      ].join("\n")
    };
  }

  if (intent === "general") {
    return {
      intent,
      nextSession: {
        intent,
        stage: "awaiting_details"
      },
      reply: [
        "Recebi sua descri\u00e7\u00e3o inicial e vou organizar a triagem com governan\u00e7a humana.",
        "Para avan\u00e7ar sem ficar preso ao menu, responda em uma \u00fanica mensagem:",
        "1. nome e melhor contato;",
        "2. cidade/UF;",
        "3. assunto principal;",
        "4. se existe prazo ou urg\u00eancia.",
        "",
        "Evite enviar senhas, tokens, c\u00f3digos ou documentos sens\u00edveis por aqui."
      ].join("\n")
    };
  }

  return {
    intent,
    nextSession: {
      intent,
      stage: "menu"
    },
    reply: TRIAGE_MENU_REPLY
  };
}

export function inferTriageIntent(text) {
  const normalized = normalizeForTriage(text);

  if (!normalized || isGreetingOnly(normalized)) {
    return "menu";
  }

  if (/^(1)\b/.test(normalized) || /\b(urgente|urgencia|prazo|audiencia|liminar|intimacao|hoje|amanha|vencendo|imediato|grave|risco|emergencia)\b/.test(normalized)) {
    return "urgent";
  }

  if (/\b(heranca|herdeiro|inventario|espolio|falecimento|obito|pai morreu|mae morreu|bens deixados|bens do meu pai|bens da minha mae)\b/.test(normalized)) {
    return "inheritance";
  }

  if (/^(4)\b/.test(normalized) || /\b(humano|atendente|pessoa|clovis|falar com alguem|retorno|preciso de atendimento|quero atendimento|atendimento humano)\b/.test(normalized)) {
    return "human";
  }

  if (/^(2)\b/.test(normalized) || /\b(documento|processo|contrato|peticao|sentenca|decisao|anexo|pdf)\b/.test(normalized)) {
    return "document";
  }

  return "general";
}

function buildAlreadySelectedReply(intent) {
  if (intent === "urgent") {
    return [
      "Voc\u00ea j\u00e1 marcou este atendimento como urg\u00eancia.",
      "Agora envie os dados m\u00ednimos em uma \u00fanica mensagem:",
      "1. nome ou forma de contato;",
      "2. cidade/UF;",
      "3. tipo de prazo ou ato;",
      "4. data limite, se houver.",
      "",
      "Se o prazo \u00e9 hoje ou h\u00e1 risco imediato, acione tamb\u00e9m o respons\u00e1vel humano por liga\u00e7\u00e3o."
    ].join("\n");
  }

  if (intent === "human") {
    return [
      "Voc\u00ea j\u00e1 pediu atendimento humano.",
      "Agora envie nome, melhor hor\u00e1rio de retorno e resumo breve do assunto em uma \u00fanica mensagem."
    ].join("\n");
  }

  return [
    "Voc\u00ea j\u00e1 iniciou essa triagem.",
    "Para avan\u00e7ar, envie os dados m\u00ednimos em uma \u00fanica mensagem: nome/contato, cidade/UF, assunto principal e urg\u00eancia ou prazo."
  ].join("\n");
}

function buildNewAttendanceReply() {
  return [
    "Novo atendimento iniciado.",
    "",
    TRIAGE_MENU_REPLY
  ].join("\n");
}

function buildPressedTriageStartReply(intent) {
  return [
    "Entendi. Vou sair do menu e organizar sua triagem agora.",
    `Status inicial: escuta dirigida para supervis\u00e3o humana (${triageIntentLabel(intent)}).`,
    "",
    "Responda em uma \u00fanica mensagem, sem documentos e sem dados sens\u00edveis:",
    "1. seu nome ou forma de contato;",
    "2. cidade/UF;",
    "3. resumo curto da situa\u00e7\u00e3o;",
    "4. se h\u00e1 risco imediato, prazo hoje ou algu\u00e9m em perigo.",
    "",
    "A Charlie Echo organiza a triagem, mas atendimento sens\u00edvel depende de supervis\u00e3o humana."
  ].join("\n");
}

function buildDetailsReceivedReply(intent) {
  const label = triageIntentLabel(intent);

  return [
    "Recebi os dados m\u00ednimos para triagem.",
    `Status: pronto para atendimento humano (${label}).`,
    "",
    "Voc\u00ea n\u00e3o precisa repetir tudo agora; o mais importante j\u00e1 foi organizado.",
    "Pr\u00f3ximo passo: um respons\u00e1vel humano da Jus 9 Tecnologia Jur\u00eddica deve revisar o caso antes de qualquer orienta\u00e7\u00e3o jur\u00eddica.",
    "Enquanto isso, n\u00e3o envie senhas, tokens, c\u00f3digos de acesso ou documentos sens\u00edveis por aqui.",
    "",
    "Se houver prazo hoje, audi\u00eancia, risco de perda de direito ou situa\u00e7\u00e3o grave, acione o respons\u00e1vel humano tamb\u00e9m por liga\u00e7\u00e3o ou canal direto."
  ].join("\n");
}

function buildHighRiskDetailsReceivedReply(intent) {
  const label = triageIntentLabel(intent);

  return [
    "Recebi os dados m\u00ednimos e entendi que voc\u00ea descreveu risco alto.",
    `Status: pronto para revis\u00e3o humana priorit\u00e1ria (${label}).`,
    "",
    "Pr\u00e9-an\u00e1lise segura: quando h\u00e1 risco de vida, viol\u00eancia, amea\u00e7a ou perigo acontecendo agora, n\u00e3o espere apenas este WhatsApp.",
    buildImmediateEmergencyGuidance(),
    "",
    "A Charlie Echo organiza e protege a triagem, mas n\u00e3o garante liga\u00e7\u00e3o imediata, n\u00e3o substitui socorro presencial e n\u00e3o toma decis\u00e3o jur\u00eddica final.",
    "N\u00e3o envie documentos, senhas, tokens, c\u00f3digos ou detalhes sens\u00edveis por aqui. Se precisar complementar, envie s\u00f3 cidade/UF e uma frase curta sobre o risco."
  ].join("\n");
}

function buildContinuityReply(intent) {
  return [
    "Continua o mesmo atendimento.",
    `Status atual: pronto para atendimento humano (${triageIntentLabel(intent)}).`,
    "",
    "Se voc\u00ea quiser acrescentar algo, envie como complemento curto. Se for outro caso, escreva: NOVO ATENDIMENTO.",
    "Para este caso, n\u00e3o precisa repetir nome, cidade e assunto se eles j\u00e1 foram informados."
  ].join("\n");
}

function buildImmediateDangerReply(intent) {
  return [
    "Eu entendi: isso n\u00e3o \u00e9 apenas complemento, \u00e9 sinal de risco imediato.",
    `Status: triagem mantida para revis\u00e3o humana priorit\u00e1ria (${triageIntentLabel(intent)}).`,
    "",
    "Se h\u00e1 risco de morte, viol\u00eancia, amea\u00e7a ou perigo acontecendo agora, acione emerg\u00eancia imediatamente.",
    buildImmediateEmergencyGuidance(),
    "",
    "Eu n\u00e3o consigo garantir liga\u00e7\u00e3o autom\u00e1tica nem substituir atendimento humano imediato.",
    "Para sua seguran\u00e7a, n\u00e3o envie documentos, senhas, tokens, c\u00f3digos ou detalhes sens\u00edveis aqui. Envie no m\u00e1ximo cidade/UF e uma frase curta sem expor terceiros."
  ].join("\n");
}

function buildHumanReturnExpectationReply(intent) {
  return [
    "Eu entendi que voc\u00ea quer uma resposta humana agora.",
    `Status: a triagem j\u00e1 est\u00e1 organizada para revis\u00e3o humana (${triageIntentLabel(intent)}).`,
    "",
    "Com honestidade: por este WhatsApp eu n\u00e3o consigo garantir liga\u00e7\u00e3o imediata nem fazer atendimento jur\u00eddico sens\u00edvel sozinha.",
    "O passo mais seguro \u00e9 manter a triagem enxuta aqui e acionar tamb\u00e9m o canal humano direto da Jus 9 quando houver prazo, risco ou urg\u00eancia.",
    "",
    `Se houver risco de vida, viol\u00eancia ou perigo neste momento, n\u00e3o espere retorno: procure um local seguro e acione emerg\u00eancia local. ${buildImmediateEmergencyGuidance()}`,
    "N\u00e3o envie dados sens\u00edveis por aqui. Se precisar complementar, envie apenas cidade/UF, melhor contato e uma frase curta sobre a urg\u00eancia."
  ].join("\n");
}

function buildSocialListeningOfferReply(intent) {
  return [
    "Complemento recebido e anexado \u00e0 triagem deste mesmo atendimento.",
    `Status: entregue para supervis\u00e3o humana com urg\u00eancia (${triageIntentLabel(intent)}).`,
    "",
    "A melhor coisa \u00e9 evitar repetir informa\u00e7\u00f5es sens\u00edveis no WhatsApp.",
    "",
    "Percebi que voc\u00ea ainda precisa ser ouvido(a). Vou abrir o modo social de acolhimento da Charlie Echo Social.",
    "Esse modo n\u00e3o substitui emerg\u00eancia, psicologia, medicina, advocacia, pol\u00edcia ou atendimento humano respons\u00e1vel. Ele serve para escuta breve, prudente e protegida enquanto voc\u00ea aciona ajuda real.",
    "",
    buildSocialEmergencyGuidance(),
    "",
    "Voc\u00ea precisa conversar agora? Responda apenas SIM ou N\u00c3O, sem detalhes sens\u00edveis."
  ].join("\n");
}

function buildSocialListeningReply(intent, normalized, session) {
  const turn = getSocialListeningTurns(session) + 1;
  const intro = isSocialListeningYes(normalized)
    ? "Sim. Eu fico em escuta breve com voc\u00ea agora."
    : "Eu te ouvi. Vamos sair do looping e cuidar do pr\u00f3ximo minuto.";

  if (turn <= 1) {
    return [
      intro,
      `A triagem jur\u00eddica segue entregue para supervis\u00e3o humana (${triageIntentLabel(intent)}).`,
      "",
      "Aqui no modo social eu n\u00e3o vou pedir detalhes sens\u00edveis, nomes completos, documentos ou provas. A ideia \u00e9 te ajudar a respirar, se orientar e buscar ajuda real.",
      "",
      "Primeiro: voc\u00ea est\u00e1 em seguran\u00e7a f\u00edsica neste momento?",
      "Responda s\u00f3: ESTOU EM SEGURAN\u00c7A ou N\u00c3O ESTOU."
    ].join("\n");
  }

  return [
    "Estou acompanhando sua mensagem em modo social, sem transformar isso em parecer jur\u00eddico.",
    "",
    "Se voc\u00ea estiver em seguran\u00e7a, fa\u00e7a uma coisa simples agora: sente, encoste os p\u00e9s no ch\u00e3o e escreva em uma frase o que precisa que o humano da Jus 9 veja primeiro.",
    "Se voc\u00ea n\u00e3o estiver em seguran\u00e7a, a conversa n\u00e3o vem antes da prote\u00e7\u00e3o: procure um local seguro e acione emerg\u00eancia local.",
    "",
    "Sem dados sens\u00edveis: voc\u00ea quer que eu te ajude a organizar uma frase curta para o humano respons\u00e1vel?"
  ].join("\n");
}

function buildSocialListeningRiskReply(intent) {
  return [
    "Eu n\u00e3o vou minimizar o que voc\u00ea disse.",
    `A triagem continua marcada para supervis\u00e3o humana com urg\u00eancia (${triageIntentLabel(intent)}).`,
    "",
    "Se voc\u00ea est\u00e1 correndo perigo agora, a prioridade \u00e9 sair do risco antes de continuar a conversa.",
    buildImmediateEmergencyGuidance(),
    "",
    "Se puder responder sem se expor: voc\u00ea est\u00e1 em seguran\u00e7a f\u00edsica neste momento?",
    "Responda s\u00f3: ESTOU EM SEGURAN\u00c7A ou N\u00c3O ESTOU."
  ].join("\n");
}

function buildSocialListeningClosedReply(intent) {
  return [
    "Tudo bem. Vou manter a triagem entregue para supervis\u00e3o humana.",
    `Status: atendimento humano pendente (${triageIntentLabel(intent)}).`,
    "",
    "N\u00e3o envie dados sens\u00edveis por aqui. Se mudar de ideia e quiser conversar em modo social, escreva: QUERO CONVERSAR.",
    "Se houver perigo imediato, acione emerg\u00eancia local."
  ].join("\n");
}

function buildComfortNextStepsReply(intent) {
  return [
    "Eu entendi a ang\u00fastia. Vamos deixar isso em ordem, um passo de cada vez.",
    `Este atendimento j\u00e1 est\u00e1 sinalizado para revis\u00e3o humana (${triageIntentLabel(intent)}).`,
    "",
    "Enquanto aguarda o retorno humano, o caminho mais seguro \u00e9:",
    "1. separar documentos b\u00e1sicos, sem enviar tudo por aqui;",
    "2. anotar datas, prazos e nomes importantes;",
    "3. guardar prints ou comprovantes, se existirem;",
    "4. se o prazo for hoje ou houver risco imediato, ligar para o respons\u00e1vel humano.",
    "",
    "Eu n\u00e3o vou fingir uma decis\u00e3o jur\u00eddica. Vou ajudar a manter o caso organizado e protegido."
  ].join("\n");
}

function buildUpdateReceivedReply(intent) {
  return [
    "Complemento recebido e anexado \u00e0 triagem deste mesmo atendimento.",
    `Status: entregue para supervis\u00e3o humana com urg\u00eancia (${triageIntentLabel(intent)}).`,
    "",
    "A melhor coisa \u00e9 evitar repetir informa\u00e7\u00f5es sens\u00edveis no WhatsApp. Se houver prazo hoje ou situa\u00e7\u00e3o grave, acione tamb\u00e9m o canal humano direto."
  ].join("\n");
}

function buildImmediateEmergencyGuidance() {
  return `No Brasil: ${IMMEDIATE_EMERGENCY_CONTACTS_BR.join(", ")}. Fora do Brasil, use o servi\u00e7o de emerg\u00eancia local.`;
}

function buildSocialEmergencyGuidance() {
  return [
    "Contatos de apoio no Brasil:",
    `Emerg\u00eancia imediata: ${IMMEDIATE_EMERGENCY_CONTACTS_BR.join(", ")}.`,
    `Apoio social e emocional: ${SOCIAL_SUPPORT_CONTACTS_BR.join(", ")}.`
  ].join("\n");
}

function buildSocialListeningSession(intent, session, options = {}) {
  const pressureCount = getPostHandoffPressureCount(session);
  const socialTurns = getSocialListeningTurns(session);

  return {
    intent,
    stage: "social_listening",
    postHandoffPressureCount: options.incrementPressure ? pressureCount + 1 : pressureCount,
    socialListeningOffered: true,
    socialTurns: options.incrementTurn ? socialTurns + 1 : socialTurns
  };
}

function getPostHandoffPressureCount(session) {
  const count = Number(session?.postHandoffPressureCount || 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function getSocialListeningTurns(session) {
  const turns = Number(session?.socialTurns || 0);
  return Number.isFinite(turns) && turns > 0 ? turns : 0;
}

export function getEmergencyContactsProtocol() {
  return {
    reviewedAt: EMERGENCY_CONTACTS_REVIEWED_AT,
    sourceUrls: [...EMERGENCY_CONTACTS_SOURCE_URLS],
    immediateEmergencyBrazil: [...IMMEDIATE_EMERGENCY_CONTACTS_BR],
    socialSupportBrazil: [...SOCIAL_SUPPORT_CONTACTS_BR],
    updateRule: "Protocolos podem ser atualizados com fonte oficial, data e revisao humana. Leis internas nao podem ser alteradas pela IA sozinha."
  };
}

function isGreetingOnly(normalized) {
  return /^(oi|ola|bom dia|boa tarde|boa noite|teste|charlie|oi charlie|ok|sim|certo|tudo bem)[.!? ]*$/.test(normalized);
}

function isBareOption(normalized) {
  return /^[1-4]$/.test(normalized);
}

function isStructuredTriageDetails(text, session) {
  const normalized = normalizeForTriage(text);
  if (!normalized || isBareOption(normalized) || isGreetingOnly(normalized)) return false;

  const numberedFields = (String(text).match(/(?:^|\n)\s*[1-4][.)-]/g) || []).length;
  const hasContactSignal = /\b(nome|contato|celular|telefone|whatsapp|retorno|horario)\b/.test(normalized);
  const hasLocationSignal = /\b(cidade|uf|rio grande|sao paulo|florianopolis|curitiba|brasil)\b/.test(normalized);
  const hasDeadlineSignal = /\b(hoje|amanha|prazo|urgente|imediato|grave)\b/.test(normalized);

  if (numberedFields >= 2) return true;
  if (session?.stage === "awaiting_details" && (hasContactSignal || hasLocationSignal || hasDeadlineSignal)) return true;
  if (/\b(meu nome e|me chamo|sou o|sou a)\b/.test(normalized) && /\b(retorno|atendimento|contato|processo|caso|assunto)\b/.test(normalized)) return true;

  return false;
}

function mergeTriageIntent(currentIntent, nextIntent) {
  const current = currentIntent && currentIntent !== "menu" ? currentIntent : null;
  const next = nextIntent && nextIntent !== "menu" ? nextIntent : null;

  if (current === "inheritance" && next === "urgent") return "inheritance_urgent";
  if (current === "urgent" && next === "inheritance") return "inheritance_urgent";
  if (current === "human" && next === "inheritance") return "inheritance";
  if (current === "human" && next === "urgent") return "urgent";
  if (current === "general" && next) return next;
  return current || next || "general";
}

function triageIntentLabel(intent) {
  if (intent === "inheritance_urgent") return "invent\u00e1rio/heran\u00e7a com urg\u00eancia";
  if (intent === "inheritance") return "invent\u00e1rio/heran\u00e7a";
  if (intent === "urgent") return "urg\u00eancia";
  if (intent === "human") return "atendimento humano";
  if (intent === "document") return "documento/processo";
  return "triagem geral";
}

function isContinuityQuestion(normalized) {
  return /\b(continua|continuar|mesmo atendimento|mesmo caso|ja existe atendimento|j[aá] existe atendimento)\b/.test(normalized);
}

function isNewAttendanceCommand(normalized) {
  return /^(novo atendimento|nova triagem|novo caso|reiniciar atendimento|comecar novo atendimento|começar novo atendimento)[.!? ]*$/.test(normalized);
}

function isAnxiousFollowUp(normalized) {
  return /\b(o que posso fazer|preciso mesmo|estou angustiado|estou angustiada|estou preocupado|estou preocupada|nao sei o que fazer|n[aã]o sei o que fazer|me ajuda|me ajude|pode ser com voce|pode ser com voc[eê])\b/.test(normalized);
}

function isImmediateDangerSignal(normalized) {
  return /\b(risco de morte|risco de vida|ameaca de morte|alguem pode morrer|alguem vai morrer|posso morrer|vou morrer|querem me matar|quer me matar|socorro|correndo perigo|em perigo|perigo serio|perigo sim|perigo imediato|perigo agora|violencia agora|agressao|sequestro|arma|tiro|ferido|ferida|sangrando|ambulancia|policia|bombeiro|incendio)\b/.test(normalized);
}

function isImmediateAttentionRequest(normalized) {
  return /\b(ser atendido agora|atendido agora|atendimento agora|me atende agora|preciso que voce me atenda|preciso que me atenda|preciso ser atendido|nao esta entendendo|voce nao entendeu|voce nao ta entendendo)\b/.test(normalized);
}

function isReturnExpectationQuestion(normalized) {
  return /\b(garantia|garantir|vai me ligar|alguem vai me ligar|quando vao me ligar|quando vai me ligar|ninguem vai me ligar|retorno humano|me dar retorno|dar retorno)\b/.test(normalized);
}

function isSocialListeningRequest(normalized) {
  return /\b(quero conversar|preciso conversar|preciso muito falar|falar com alguem|falar com alguém|conversar com alguem|conversar com alguém|fala comigo|fale comigo|conversa comigo|converse comigo|me escuta|me escute|voce pode me ajudar|você pode me ajudar|pode me ouvir|preciso de ajuda|preciso ser ouvido|preciso ser ouvida)\b/.test(normalized);
}

function isSocialListeningYes(normalized) {
  return /^(sim|s|quero|quero sim|sim quero|sim eu quero|preciso|preciso sim)[.!? ]*$/.test(normalized);
}

function isSocialListeningNo(normalized) {
  return /^(nao|n[aã]o|n|nao quero|n[aã]o quero|agora nao|agora n[aã]o)[.!? ]*$/.test(normalized);
}

function isSocialNotSafeResponse(normalized) {
  return /^(nao estou|n[aã]o estou|nao estou em seguranca|n[aã]o estou em seguranca|nao estou seguro|n[aã]o estou seguro|nao estou segura|n[aã]o estou segura)[.!? ]*$/.test(normalized);
}

function isPressedFirstContact(normalized) {
  return isImmediateAttentionRequest(normalized) || isAnxiousFollowUp(normalized) || isReturnExpectationQuestion(normalized);
}

function isMeaningfulFollowUp(normalized) {
  if (!normalized || isGreetingOnly(normalized) || isBareOption(normalized)) return false;
  return normalized.length >= 16;
}

function normalizeForTriage(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function getTriageSession(from) {
  const key = String(from || "");
  const session = triageSessions.get(key);
  if (!session) return null;

  if (Date.now() - session.updatedAt > TRIAGE_SESSION_TTL_MS) {
    triageSessions.delete(key);
    return null;
  }

  return session;
}

function setTriageSession(from, session) {
  const key = String(from || "");
  if (!key || !session) return;

  triageSessions.set(key, {
    intent: session.intent,
    stage: session.stage,
    postHandoffPressureCount: getPostHandoffPressureCount(session),
    socialListeningOffered: Boolean(session.socialListeningOffered),
    socialTurns: getSocialListeningTurns(session),
    updatedAt: Date.now()
  });
}

export async function saveWhatsAppTriageProtocol({ from, text, triage }) {
  if (!triage?.shouldSaveProtocol) return { skipped: true, reason: "not_ready_for_handoff" };

  const driveSaverUrl = process.env.JUS9_DRIVE_SAVER_URL;
  const driveSaverKey = process.env.JUS9_DRIVE_SAVER_CHAVE_INTERNA;

  if (!driveSaverUrl || !driveSaverKey) {
    console.warn("Drive Saver ignorado: integracao nao configurada.", {
      hasUrl: Boolean(driveSaverUrl),
      hasInternalKey: Boolean(driveSaverKey),
      classification: triage.protocolClassification || getDriveSaverProtocolClassification()
    });
    return { skipped: true, reason: "not_configured" };
  }

  const payload = {
    chaveInterna: driveSaverKey,
    titulo: buildWhatsAppProtocolTitle(triage.intent),
    conteudo: buildWhatsAppProtocolContent({ from, text, triage }),
    classificacao: triage.protocolClassification || getDriveSaverProtocolClassification(),
    tipoDocumento: "PROTOCOLO_WHATSAPP_TRIAGEM",
    origem: "WhatsApp Cloud API / Charlie Echo da Costa",
    autorOperacional: "Charlie Echo da Costa",
    observacao: "Registro minimo de triagem para revisao humana. Nao e decisao juridica."
  };

  try {
    const response = await axios.post(driveSaverUrl, payload, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 10000
    });
    const data = response.data || {};

    if (data.ok === false) {
      console.error("Drive Saver recusou protocolo de triagem.", {
        statusCode: data.statusCode || null,
        classification: data.classificacaoFinal || payload.classificacao,
        reviewRequired: data.revisaoHumanaObrigatoria ?? null,
        cofreAutomatico: data.cofreAutomatico ?? null
      });
      return { ok: false, data };
    }

    console.log("Protocolo de triagem enviado ao Drive Saver.", {
      classification: data.classificacaoFinal || payload.classificacao,
      destination: data.pastaDestino || null,
      reviewRequired: data.revisaoHumanaObrigatoria ?? null,
      hasFileId: Boolean(data.fileId)
    });

    return { ok: true, data };
  } catch (error) {
    console.error("Falha ao enviar protocolo ao Drive Saver.", {
      message: error?.response?.data?.erro || error?.response?.data?.mensagem || error?.message || String(error),
      status: error?.response?.status || null
    });
    return { ok: false, error };
  }
}

export function buildWhatsAppProtocolTitle(intent) {
  const titleLabels = {
    details_received: "dados-minimos",
    details_received_high_risk: "dados-minimos-risco-alto",
    immediate_danger: "risco-imediato",
    human_return_expectation: "expectativa-retorno-humano"
  };
  const label = titleLabels[intent] || String(intent || "triagem");
  return `Triagem WhatsApp - ${label} - ${new Date().toISOString().slice(0, 10)}`;
}

export function buildWhatsAppProtocolContent({ from, text, triage }) {
  const classification = triage?.protocolClassification || getDriveSaverProtocolClassification();

  return [
    "PROTOCOLO DE TRIAGEM WHATSAPP - CHARLIE ECHO DA COSTA",
    "",
    `Classificacao: ${classification}`,
    "Revisao humana obrigatoria: SIM",
    "Origem: WhatsApp Cloud API",
    `Identificador WhatsApp mascarado: ${maskWhatsAppId(from)}`,
    `Intencao detectada: ${triage?.intent || "desconhecida"}`,
    `Estagio: ${triage?.nextSession?.stage || "desconhecido"}`,
    "",
    "Conteudo informado pelo usuario para triagem:",
    sanitizeProtocolText(text),
    "",
    "Aviso de governanca:",
    "Este registro organiza atendimento inicial. Nao representa parecer juridico, decisao final, promessa de resultado ou substituicao de revisao humana qualificada.",
    "Nao anexar senhas, tokens, codigos de acesso, credenciais ou documentos de cofre neste fluxo automatico."
  ].join("\n");
}

export function getDriveSaverProtocolClassification() {
  const configured = String(process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO || "")
    .trim()
    .toUpperCase();

  if (DRIVE_SAVER_ALLOWED_CLASSIFICATIONS.has(configured)) {
    return configured;
  }

  return DEFAULT_DRIVE_SAVER_CLASSIFICATION;
}

function sanitizeProtocolText(value) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, 12000) || "Sem conteudo textual informado.";
}

export async function sendWhatsAppTextMessage(to, body) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const recipients = buildWhatsAppRecipientCandidates(to);

  if (recipients.length === 0) {
    console.warn("Envio ignorado: destinatario ausente.");
    return;
  }

  if (!token || !phoneNumberId) {
    console.warn("Envio ignorado: variaveis da WhatsApp API nao configuradas.", {
      to: maskWhatsAppId(recipients[0]),
      hasToken: Boolean(token),
      hasPhoneNumberId: Boolean(phoneNumberId)
    });
    return;
  }

  const url = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
  let lastError = null;

  for (const recipient of recipients) {
    try {
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      console.log("Mensagem institucional enviada.", {
        to: maskWhatsAppId(recipient),
        usedBrazilMobileFallback: recipient !== recipients[0]
      });
      return;
    } catch (error) {
      lastError = error;
      const code = error?.response?.data?.error?.code || null;

      if (code === 131030 && recipient === recipients[0] && recipients.length > 1) {
        console.warn("Destinatario recusado pela lista de teste; tentando formato movel brasileiro alternativo.", {
          original: maskWhatsAppId(recipient),
          alternative: maskWhatsAppId(recipients[1])
        });
        continue;
      }

      break;
    }
  }

  console.error("Falha ao enviar mensagem pelo WhatsApp.", {
    to: maskWhatsAppId(recipients[0]),
    attemptedRecipients: recipients.map(maskWhatsAppId),
    status: lastError?.response?.status || null,
    code: lastError?.response?.data?.error?.code || null,
    message: lastError?.response?.data?.error?.message || lastError?.message || String(lastError)
  });
}

export function maskWhatsAppId(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 4) return "****";
  return `${"*".repeat(text.length - 4)}${text.slice(-4)}`;
}

export function buildWhatsAppRecipientCandidates(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return [];

  const candidates = [digits];
  const isBrazilianMobileWithoutNinthDigit =
    digits.startsWith("55") &&
    digits.length === 12 &&
    digits.slice(4).startsWith("9");

  if (isBrazilianMobileWithoutNinthDigit) {
    candidates.push(`${digits.slice(0, 4)}9${digits.slice(4)}`);
  }

  return [...new Set(candidates)];
}

const currentFilePath = fileURLToPath(import.meta.url);
const launchedFilePath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFilePath === launchedFilePath) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`${SERVICE_NAME} rodando na porta ${port}`);
  });
}
