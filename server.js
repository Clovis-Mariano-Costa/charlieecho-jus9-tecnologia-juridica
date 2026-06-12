import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const SERVICE_NAME = "WhatsApp Charlie Echo da Costa";
const COMPANY_NAME = "Jus 9 Tecnologia Jur\u00eddica";
const DEFAULT_GRAPH_API_VERSION = "v20.0";
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
const DRIVE_SAVER_CLASSIFICATION = "JURIDICO_SIGILOSO";

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

  if (isStructuredTriageDetails(text, session)) {
    const resolvedIntent = session?.intent && session.intent !== "menu" ? session.intent : intent;
    return {
      intent: "details_received",
      nextSession: {
        intent: resolvedIntent,
        stage: "ready_for_handoff"
      },
      shouldSaveProtocol: true,
      protocolClassification: DRIVE_SAVER_CLASSIFICATION,
      reply: buildDetailsReceivedReply(resolvedIntent)
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

function buildDetailsReceivedReply(intent) {
  const label = intent === "inheritance"
    ? "invent\u00e1rio/heran\u00e7a"
    : intent === "urgent"
      ? "urg\u00eancia"
      : intent === "human"
        ? "atendimento humano"
        : intent === "document"
          ? "documento/processo"
          : "triagem geral";

  return [
    "Recebi os dados m\u00ednimos para triagem.",
    `Status: pronto para atendimento humano (${label}).`,
    "",
    "Pr\u00f3ximo passo: um respons\u00e1vel humano da Jus 9 Tecnologia Jur\u00eddica deve revisar o caso antes de qualquer orienta\u00e7\u00e3o jur\u00eddica.",
    "Enquanto isso, n\u00e3o envie senhas, tokens, c\u00f3digos de acesso ou documentos sens\u00edveis por aqui.",
    "",
    "Se houver prazo hoje, audi\u00eancia, risco de perda de direito ou situa\u00e7\u00e3o grave, acione o respons\u00e1vel humano tamb\u00e9m por liga\u00e7\u00e3o ou canal direto."
  ].join("\n");
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
      classification: triage.protocolClassification || DRIVE_SAVER_CLASSIFICATION
    });
    return { skipped: true, reason: "not_configured" };
  }

  const payload = {
    chaveInterna: driveSaverKey,
    titulo: buildWhatsAppProtocolTitle(triage.intent),
    conteudo: buildWhatsAppProtocolContent({ from, text, triage }),
    classificacao: triage.protocolClassification || DRIVE_SAVER_CLASSIFICATION,
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
  const label = intent === "details_received" ? "dados-minimos" : String(intent || "triagem");
  return `Triagem WhatsApp - ${label} - ${new Date().toISOString().slice(0, 10)}`;
}

export function buildWhatsAppProtocolContent({ from, text, triage }) {
  return [
    "PROTOCOLO DE TRIAGEM WHATSAPP - CHARLIE ECHO DA COSTA",
    "",
    "Classificacao: JURIDICO_SIGILOSO",
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
