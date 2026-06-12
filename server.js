import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const SERVICE_NAME = "WhatsApp Charlie Echo da Costa";
const COMPANY_NAME = "Jus 9 Tecnologia Jur\u00eddica";
const DEFAULT_GRAPH_API_VERSION = "v20.0";
const INSTITUTIONAL_REPLY =
  "Ol\u00e1. Aqui \u00e9 o atendimento oficial da Jus 9 Tecnologia Jur\u00eddica. " +
  "Recebemos sua mensagem e vamos iniciar a triagem com governan\u00e7a humana.";

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

  await sendWhatsAppTextMessage(from, INSTITUTIONAL_REPLY);

  console.log("Charlie Echo processou mensagem.", {
    from: maskWhatsAppId(from),
    hasOriginalText: Boolean(normalizedText)
  });
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
