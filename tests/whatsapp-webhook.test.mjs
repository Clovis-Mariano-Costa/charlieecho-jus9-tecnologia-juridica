import assert from "node:assert/strict";
import test from "node:test";

process.env.VERIFY_TOKEN = "jus9_echo_verify_2026";
delete process.env.WHATSAPP_TOKEN;
delete process.env.WHATSAPP_PHONE_NUMBER_ID;

const {
  app,
  buildGovernedTriageReply,
  buildWhatsAppProtocolContent,
  buildWhatsAppProtocolTitle,
  buildWhatsAppRecipientCandidates,
  extractIncomingMessages,
  inferTriageIntent,
  maskWhatsAppId
} = await import("../server.js");

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${port}`
      });
    });
  });
}

test("GET / returns the healthcheck payload", async () => {
  const { server, url } = await listen();

  try {
    const response = await fetch(`${url}/`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "WhatsApp Charlie Echo da Costa");
    assert.equal(body.company, "Jus 9 Tecnologia Jur\u00eddica");
  } finally {
    server.close();
  }
});

test("GET /webhook validates Meta challenge with the configured token", async () => {
  const { server, url } = await listen();

  try {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "jus9_echo_verify_2026",
      "hub.challenge": "123456"
    });
    const response = await fetch(`${url}/webhook?${params}`);

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "123456");
  } finally {
    server.close();
  }
});

test("GET /webhook rejects invalid tokens", async () => {
  const { server, url } = await listen();

  try {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "wrong-token",
      "hub.challenge": "123456"
    });
    const response = await fetch(`${url}/webhook?${params}`);

    assert.equal(response.status, 403);
  } finally {
    server.close();
  }
});

test("POST /webhook responds quickly even without WhatsApp credentials", async () => {
  const { server, url } = await listen();

  try {
    const response = await fetch(`${url}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "5511999999999",
                      id: "wamid.test",
                      timestamp: "1780000000",
                      type: "text",
                      text: { body: "Ola" }
                    }
                  ]
                }
              }
            ]
          }
        ]
      })
    });

    assert.equal(response.status, 200);
  } finally {
    server.close();
  }
});

test("extractIncomingMessages handles Meta entries and masks identifiers", () => {
  const messages = extractIncomingMessages({
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: "5511987654321",
                  type: "text",
                  text: { body: "Teste" }
                }
              ]
            }
          }
        ]
      }
    ]
  });

  assert.equal(messages.length, 1);
  assert.equal(messages[0].from, "5511987654321");
  assert.equal(messages[0].text, "Teste");
  assert.equal(maskWhatsAppId(messages[0].from), "*********4321");
});

test("buildWhatsAppRecipientCandidates adds Brazilian mobile fallback when ninth digit is missing", () => {
  assert.deepEqual(
    buildWhatsAppRecipientCandidates("554899082726"),
    ["554899082726", "5548999082726"]
  );

  assert.deepEqual(
    buildWhatsAppRecipientCandidates("5548999082726"),
    ["5548999082726"]
  );
});

test("inferTriageIntent classifies governed WhatsApp triage messages", () => {
  assert.equal(inferTriageIntent("Oi Charlie"), "menu");
  assert.equal(inferTriageIntent("1 urgente, tenho prazo hoje"), "urgent");
  assert.equal(inferTriageIntent("Oi, meu pai morreu e quero saber sobre heranca"), "inheritance");
  assert.equal(inferTriageIntent("Preciso revisar um contrato em PDF"), "document");
  assert.equal(inferTriageIntent("Quero falar com atendimento humano"), "human");
  assert.equal(inferTriageIntent("Eu preciso de atendimento"), "human");
  assert.equal(inferTriageIntent("Meu nome e X e preciso de retorno imediato, o processo e grave"), "urgent");
  assert.equal(inferTriageIntent("Tenho uma duvida sobre atendimento"), "general");
});

test("buildGovernedTriageReply keeps legal triage under human governance", () => {
  const menu = buildGovernedTriageReply("Oi");
  const urgent = buildGovernedTriageReply("prazo urgente amanha");
  const document = buildGovernedTriageReply("tenho documento do processo");
  const inheritance = buildGovernedTriageReply("Oi, meu pai morreu e queria saber se existe heranca");

  assert.equal(menu.intent, "menu");
  assert.match(menu.reply, /governan\u00e7a humana/);
  assert.match(menu.reply, /n\u00e3o substitui an\u00e1lise humana qualificada/i);

  assert.equal(urgent.intent, "urgent");
  assert.match(urgent.reply, /n\u00e3o tomo decis\u00e3o jur\u00eddica final/i);

  assert.equal(document.intent, "document");
  assert.match(document.reply, /sem dados sens\u00edveis/i);

  assert.equal(inheritance.intent, "inheritance");
  assert.match(inheritance.reply, /invent\u00e1rio, heran\u00e7a/i);
  assert.doesNotMatch(inheritance.reply, /responda com uma op\u00e7\u00e3o/i);
});

test("buildGovernedTriageReply advances instead of looping after a selected route", () => {
  const selected = buildGovernedTriageReply("1");
  const repeated = buildGovernedTriageReply("1", selected.nextSession);
  const details = buildGovernedTriageReply(
    "1. Nome de teste\n2. Cidade/UF\n3. Contato\n4. Hoje",
    repeated.nextSession
  );

  assert.equal(selected.intent, "urgent");
  assert.equal(selected.nextSession.stage, "awaiting_details");
  assert.equal(repeated.intent, "urgent");
  assert.match(repeated.reply, /j\u00e1 marcou este atendimento como urg\u00eancia/i);
  assert.equal(details.intent, "details_received");
  assert.equal(details.nextSession.stage, "ready_for_handoff");
  assert.equal(details.shouldSaveProtocol, true);
  assert.equal(details.protocolClassification, "JURIDICO_SIGILOSO");
  assert.match(details.reply, /pronto para atendimento humano/i);
});

test("buildWhatsAppProtocolContent creates a governed Drive Saver protocol", () => {
  const triage = buildGovernedTriageReply(
    "1. Nome de teste\n2. Cidade/UF\n3. Inventario\n4. Hoje",
    { intent: "inheritance", stage: "awaiting_details" }
  );
  const content = buildWhatsAppProtocolContent({
    from: "554899082726",
    text: "1. Nome de teste\n2. Cidade/UF\n3. Inventario\n4. Hoje",
    triage
  });

  assert.match(buildWhatsAppProtocolTitle(triage.intent), /^Triagem WhatsApp - dados-minimos - \d{4}-\d{2}-\d{2}$/);
  assert.match(content, /Classificacao: JURIDICO_SIGILOSO/);
  assert.match(content, /Revisao humana obrigatoria: SIM/);
  assert.match(content, /Identificador WhatsApp mascarado: \*+2726/);
  assert.match(content, /Nao representa parecer juridico/i);
});
