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
  getDriveSaverProtocolClassification,
  getEmergencyContactsProtocol,
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

test("buildGovernedTriageReply handles continuity and anxious follow-up after handoff", () => {
  const details = buildGovernedTriageReply(
    "1. Nome de teste\n2. Cidade/UF\n3. Heranca\n4. Hoje",
    { intent: "inheritance", stage: "awaiting_details" }
  );
  const continuity = buildGovernedTriageReply(
    "Ola, e um novo atendimento ou continua o mesmo?",
    details.nextSession
  );
  const comfort = buildGovernedTriageReply(
    "Eu preciso mesmo de atendimento, o que posso fazer?",
    continuity.nextSession
  );

  assert.equal(continuity.intent, "continuity");
  assert.match(continuity.reply, /Continua o mesmo atendimento/i);
  assert.doesNotMatch(continuity.reply, /responda em uma \u00fanica mensagem/i);

  assert.equal(comfort.intent, "comfort_next_steps");
  assert.match(comfort.reply, /Eu entendi a ang\u00fastia/i);
  assert.match(comfort.reply, /um passo de cada vez/i);
  assert.doesNotMatch(comfort.reply, /responda em uma \u00fanica mensagem/i);
});

test("buildGovernedTriageReply resets the session when user asks for a new attendance", () => {
  const details = buildGovernedTriageReply(
    "1. Nome de teste\n2. Cidade/UF\n3. Urgente\n4. Hoje",
    { intent: "urgent", stage: "awaiting_details" }
  );
  const reset = buildGovernedTriageReply("NOVO ATENDIMENTO", details.nextSession);
  const nextSelection = buildGovernedTriageReply("1", reset.nextSession);

  assert.equal(reset.intent, "new_attendance");
  assert.equal(reset.nextSession.stage, "menu");
  assert.equal(reset.nextSession.postHandoffPressureCount, 0);
  assert.match(reset.reply, /Novo atendimento iniciado/i);
  assert.match(reset.reply, /Para iniciar a triagem/i);
  assert.doesNotMatch(reset.reply, /Continua o mesmo atendimento/i);

  assert.equal(nextSelection.intent, "urgent");
  assert.equal(nextSelection.nextSession.stage, "awaiting_details");
});

test("buildGovernedTriageReply recognizes high-risk distress instead of looping on complements", () => {
  const firstContactHelp = buildGovernedTriageReply("Socorro");
  const pressuredFirstContact = buildGovernedTriageReply("Eu preciso ser atendido agora");
  const highRiskDetails = buildGovernedTriageReply(
    "Eu sou o Pedrinho de Londrina, o tipo de prazo e risco de morte, a data limite e o quanto antes",
    { intent: "urgent", stage: "awaiting_details" }
  );
  const attentionNow = buildGovernedTriageReply(
    "Voce nao entendeu, eu preciso ser atendido agora",
    highRiskDetails.nextSession
  );
  const guarantee = buildGovernedTriageReply(
    "Minha querida qual a garantia que eu tenho que alguem vai me ligar?",
    attentionNow.nextSession
  );
  const danger = buildGovernedTriageReply(
    "Voce nao ta entendendo, alguem pode morrer",
    guarantee.nextSession
  );
  const help = buildGovernedTriageReply("Por favor socorro", danger.nextSession);

  assert.equal(firstContactHelp.intent, "immediate_danger");
  assert.equal(firstContactHelp.nextSession.stage, "ready_for_handoff");
  assert.equal(firstContactHelp.shouldSaveProtocol, true);
  assert.match(firstContactHelp.reply, /risco imediato/i);
  assert.match(firstContactHelp.reply, /190.*192.*193/i);

  assert.equal(pressuredFirstContact.intent, "pressed_triage_start");
  assert.equal(pressuredFirstContact.nextSession.stage, "awaiting_details");
  assert.match(pressuredFirstContact.reply, /Vou sair do menu/i);
  assert.match(pressuredFirstContact.reply, /nome ou forma de contato/i);

  assert.equal(highRiskDetails.intent, "details_received_high_risk");
  assert.equal(highRiskDetails.nextSession.stage, "ready_for_handoff");
  assert.equal(highRiskDetails.shouldSaveProtocol, true);
  assert.match(highRiskDetails.reply, /risco alto/i);
  assert.match(highRiskDetails.reply, /190.*192.*193/i);
  assert.match(highRiskDetails.reply, /N\u00e3o envie documentos/i);

  assert.equal(attentionNow.intent, "human_return_expectation");
  assert.equal(attentionNow.nextSession.postHandoffPressureCount, 1);
  assert.match(attentionNow.reply, /n\u00e3o consigo garantir liga\u00e7\u00e3o imediata/i);
  assert.match(attentionNow.reply, /canal humano direto/i);
  assert.doesNotMatch(attentionNow.reply, /Complemento recebido/i);

  assert.equal(guarantee.intent, "human_return_expectation");
  assert.equal(guarantee.nextSession.postHandoffPressureCount, 2);
  assert.match(guarantee.reply, /Com honestidade/i);
  assert.match(guarantee.reply, /n\u00e3o consigo garantir liga\u00e7\u00e3o imediata/i);

  assert.equal(danger.intent, "social_listening_offer");
  assert.equal(danger.nextSession.postHandoffPressureCount, 3);
  assert.equal(danger.nextSession.socialListeningOffered, true);
  assert.match(danger.reply, /Charlie Echo Social/i);
  assert.match(danger.reply, /188.*180.*100/i);
  assert.match(danger.reply, /Voc\u00ea precisa conversar agora/i);

  assert.equal(help.intent, "immediate_danger");
  assert.match(help.reply, /n\u00e3o \u00e9 apenas complemento/i);
  assert.match(help.reply, /190.*192.*193/i);
});

test("buildGovernedTriageReply opens social listening when user explicitly asks to talk", () => {
  const details = buildGovernedTriageReply(
    "Meu nome e Joaozinho, cidade Mariazinha da Penha, assunto urgente, estou correndo perigo",
    { intent: "urgent", stage: "awaiting_details" }
  );
  const talk = buildGovernedTriageReply(
    "Eu quero conversar com alguem, voce pode me ajudar?",
    details.nextSession
  );
  const talkAgain = buildGovernedTriageReply(
    "Vamos la, fala comigo do jeito que tu sabe",
    talk.nextSession
  );

  assert.equal(details.intent, "details_received_high_risk");
  assert.match(details.reply, /risco alto/i);

  assert.equal(talk.intent, "social_listening_offer");
  assert.equal(talk.nextSession.socialListeningOffered, true);
  assert.match(talk.reply, /Charlie Echo Social/i);
  assert.match(talk.reply, /Voc\u00ea precisa conversar agora/i);

  assert.equal(talkAgain.intent, "social_listening_offer");
  assert.match(talkAgain.reply, /Charlie Echo Social/i);
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

test("getDriveSaverProtocolClassification allows explicit assisted vault deposit only", () => {
  const previous = process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO;

  try {
    delete process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO;
    assert.equal(getDriveSaverProtocolClassification(), "JURIDICO_SIGILOSO");

    process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO = "COFRE_DEPOSITO_ASSISTIDO";
    assert.equal(getDriveSaverProtocolClassification(), "COFRE_DEPOSITO_ASSISTIDO");

    process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO = "COFRE_NAO_AUTOMATICO";
    assert.equal(getDriveSaverProtocolClassification(), "JURIDICO_SIGILOSO");
  } finally {
    if (previous === undefined) {
      delete process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO;
    } else {
      process.env.JUS9_DRIVE_SAVER_CLASSIFICACAO_PROTOCOLO = previous;
    }
  }
});

test("getEmergencyContactsProtocol keeps emergency contacts as auditable protocol data", () => {
  const protocol = getEmergencyContactsProtocol();

  assert.equal(protocol.reviewedAt, "2026-06-12");
  assert.deepEqual(protocol.immediateEmergencyBrazil, [
    "190 (Pol\u00edcia Militar)",
    "192 (SAMU)",
    "193 (Bombeiros)"
  ]);
  assert.match(protocol.socialSupportBrazil.join(" "), /188.*180.*100/);
  assert.ok(protocol.sourceUrls.some((url) => url.includes("gov.br")));
  assert.match(protocol.updateRule, /Protocolos podem ser atualizados/i);
  assert.match(protocol.updateRule, /Leis internas nao podem ser alteradas pela IA sozinha/i);
});
