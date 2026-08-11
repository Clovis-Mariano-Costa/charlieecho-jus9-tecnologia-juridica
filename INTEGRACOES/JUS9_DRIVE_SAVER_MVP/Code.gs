/**
 * JUS9_DRIVE_SAVER_MVP
 * Mini-backend gratuito em Google Apps Script para salvar documentos da Charlie Echo.
 *
 * Regra maior:
 * - Nao pedir senha Google.
 * - Nao salvar token, chave, .env ou segredo.
 * - Nao ler, editar, excluir ou sobrescrever conteudo de cofre.
 * - Escrever no cofre somente pela rota COFRE_DEPOSITO_ASSISTIDO.
 * - Nao editar, excluir ou sobrescrever arquivos existentes.
 * - Criar sempre novo documento com cabecalho de classificacao.
 * - Criar link publico de download somente para PUBLICO e quando solicitado.
 * - Acoes corretivas governadas podem revogar link publico, mover para revisao
 *   ou enviar arquivo criado pelo Drive Saver para lixeira governada.
 *
 * Script Property obrigatoria:
 * CHAVE_INTERNA = segredo HMAC definido pelo Fundador nas Propriedades do script.
 * JUS9_REQUIRE_SIGNED_REQUESTS = true para exigir assinatura HMAC e replay protection.
 * JUS9_ALLOW_LEGACY_KEY = false para bloquear o modo de transicao com chave em claro.
 * JUS9_PREVIOUS_HMAC_KEY = opcional, chave anterior durante a rotacao controlada.
 * JUS9_AUDIT_HMAC_KEY = opcional, segredo separado para encadear registros de auditoria.
 * JUS9_SIGNING_KEY_ID = identificador publico da versao da chave, sem o valor secreto.
 *
 * Script Properties de destino:
 * JUS9_FOLDER_ENTRADA_REVISAO
 * JUS9_FOLDER_PUBLICO
 * JUS9_FOLDER_INTERNO
 * JUS9_FOLDER_COFRE_DEPOSITO = opcional, somente para deposito assistido write-only.
 */

const JUS9_DRIVE_SAVER_CONFIG = {
  folderPropertyKeys: {
    ENTRADA_REVISAO: "JUS9_FOLDER_ENTRADA_REVISAO",
    PUBLICO: "JUS9_FOLDER_PUBLICO",
    INTERNO: "JUS9_FOLDER_INTERNO",
    COFRE_DEPOSITO: "JUS9_FOLDER_COFRE_DEPOSITO"
  },
  maxContentLength: 90000,
  idempotencyTtlSeconds: 21600,
  maxBodyBytes: 120000,
  maxMetadataLength: 300,
  maxNonceLength: 128,
  requestTimestampSkewSeconds: 300,
  replayTtlSeconds: 600,
  minimumSecretLength: 32
};

const JUS9_SIGNED_REQUEST_FIELDS = [
  "acao",
  "action",
  "idempotencyKey",
  "titulo",
  "title",
  "conteudo",
  "classificacao",
  "tipoDocumento",
  "origem",
  "autorOperacional",
  "observacao",
  "criarLinkDownload",
  "fileId",
  "id",
  "documentId",
  "motivo"
];

function doGet() {
  return json_({
    ok: true,
    service: "JUS9_DRIVE_SAVER_MVP",
    message: "Servico ativo. Use POST JSON autenticado por assinatura HMAC.",
    requestAuth: getRequestAuthStatus_(),
    securityLimits: {
      maxBodyBytes: JUS9_DRIVE_SAVER_CONFIG.maxBodyBytes,
      maxContentLength: JUS9_DRIVE_SAVER_CONFIG.maxContentLength,
      requestTimestampSkewSeconds: JUS9_DRIVE_SAVER_CONFIG.requestTimestampSkewSeconds,
      replayTtlSeconds: JUS9_DRIVE_SAVER_CONFIG.replayTtlSeconds
    },
    cofreAutomatico: false,
    requiredScriptProperties: [
      "CHAVE_INTERNA",
      "JUS9_FOLDER_ENTRADA_REVISAO",
      "JUS9_FOLDER_PUBLICO",
      "JUS9_FOLDER_INTERNO"
    ],
    optionalScriptProperties: [
      "JUS9_FOLDER_COFRE_DEPOSITO",
      "JUS9_REQUIRE_SIGNED_REQUESTS",
      "JUS9_ALLOW_LEGACY_KEY",
      "JUS9_PREVIOUS_HMAC_KEY",
      "JUS9_AUDIT_HMAC_KEY",
      "JUS9_SIGNING_KEY_ID"
    ],
    cofreDepositoAssistido: "Somente cria documento novo. Nao le, edita, exclui, sobrescreve nem lista conteudo de cofre.",
    linkDownloadGovernado: "Use criarLinkDownload=true somente para classificacao PUBLICO.",
    acoesGovernadas: [
      "RESTRINGIR_LINK_PUBLICO",
      "MOVER_PARA_REVISAO",
      "RESTRINGIR_E_MOVER_PARA_REVISAO",
      "ENVIAR_LIXEIRA_GOVERNADA"
    ],
    regraAcoesGovernadas: "Acoes corretivas exigem fileId de documento criado pelo Drive Saver e geram auditId."
  });
}

function doPost(e) {
  const requestId = Utilities.getUuid();
  try {
    const payload = parsePayload_(e);
    validateRequestAuthentication_(payload);
    const acao = normalizeAction_(payload.acao || payload.action || "CRIAR_DOCUMENTO");
    const idempotencyKey = normalizeIdempotencyKey_(payload.idempotencyKey);
    const previousResult = readIdempotentResult_(idempotencyKey);
    if (previousResult) {
      return json_(Object.assign({}, previousResult, {
        idempotentReplay: true,
        requestId,
        mensagem: previousResult.mensagem || "Operacao ja concluida; retorno idempotente reutilizado."
      }));
    }

    if (acao !== "CRIAR_DOCUMENTO") {
      const normalizedAction = normalizeGovernedActionRequest_(payload, acao);
      const actionResult = performGovernedFileAction_(normalizedAction);
      storeIdempotentResult_(idempotencyKey, actionResult);
      logSafe_(actionResult.status || "ACAO_GOVERNADA", normalizedAction, {
        folderName: actionResult.pastaDestino || "ACAO_GOVERNADA"
      }, normalizedAction.fileId, actionResult.auditId);
      return json_(Object.assign({}, actionResult, { requestId }));
    }

    const normalized = normalizeRequest_(payload);
    const route = resolveRoute_(normalized.classificacao);

    if (route.blocked) {
      logSafe_("BLOQUEADO", normalized, route);
      return json_({
        ok: false,
        status: "BLOQUEADO",
        mensagem: route.message,
        classificacaoFinal: normalized.classificacao,
        revisaoHumanaObrigatoria: true,
        cofreAutomatico: false
      }, 403);
    }

    const created = createGovernedDocument_(normalized, route);
    logSafe_("CRIADO", normalized, route, created.fileId);

    const result = {
      ok: true,
      mensagem: "Documento salvo com governanca no Cartorio Digital Charlie Echo.",
      fileId: created.fileId,
      url: created.url,
      viewUrl: created.viewUrl,
      downloadUrl: created.downloadUrl,
      linkPublicoCriado: created.linkPublicoCriado,
      linkGovernado: created.linkGovernado,
      conteudoDigest: created.conteudoDigest,
      classificacaoFinal: normalized.classificacao,
      pastaDestino: route.folderName,
      revisaoHumanaObrigatoria: route.reviewRequired,
      cofreAutomatico: false,
      cofreDepositoAssistido: Boolean(route.vaultDepositOnly),
      requestId
    };
    storeIdempotentResult_(idempotencyKey, result);
    return json_(result);
  } catch (error) {
    return json_({
      ok: false,
      requestId,
      mensagem: "Falha no salvamento governado.",
      erro: sanitizeErrorMessage_(error)
    }, 400);
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("POST sem corpo JSON.");
  }
  const contentType = String(e.postData.type || "").toLowerCase();
  if (contentType && contentType.indexOf("application/json") === -1) {
    throw new Error("Use Content-Type application/json.");
  }
  const rawBody = String(e.postData.contents);
  const bodyBytes = Utilities.newBlob(rawBody).getBytes().length;
  if (bodyBytes > JUS9_DRIVE_SAVER_CONFIG.maxBodyBytes) {
    throw new Error("Corpo JSON excede o limite de seguranca.");
  }
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    throw new Error("Corpo JSON invalido.");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("O corpo JSON deve ser um objeto.");
  }
  return payload;
}

function validateRequestAuthentication_(payload) {
  const signature = String(payload.assinatura || payload.signature || "").trim();
  const requireSigned = getBooleanScriptProperty_("JUS9_REQUIRE_SIGNED_REQUESTS", false);

  if (signature) {
    validateSignedRequest_(payload, signature);
    return;
  }

  const allowLegacy = getBooleanScriptProperty_("JUS9_ALLOW_LEGACY_KEY", !requireSigned);
  if (allowLegacy && !requireSigned) {
    validateLegacyInternalKey_(payload.chaveInterna);
    return;
  }

  throw new Error("Assinatura HMAC obrigatoria.");
}

function validateSignedRequest_(payload, signature) {
  const timestamp = Number(payload.timestamp);
  const nonce = String(payload.nonce || "").trim();
  const now = Math.floor(Date.now() / 1000);
  if (!isFinite(timestamp) || Math.floor(timestamp) !== timestamp) {
    throw new Error("Timestamp de assinatura invalido.");
  }
  if (Math.abs(now - timestamp) > JUS9_DRIVE_SAVER_CONFIG.requestTimestampSkewSeconds) {
    throw new Error("Assinatura fora da janela de tempo.");
  }
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(nonce) || nonce.length > JUS9_DRIVE_SAVER_CONFIG.maxNonceLength) {
    throw new Error("Nonce de assinatura invalido.");
  }

  const signingInput = `${Math.floor(timestamp)}.${nonce}.${canonicalizeSignedRequest_(payload)}`;
  const normalizedSignature = normalizeBase64Url_(signature);
  const signatureMatches = getCandidateRequestSecrets_().some(function(secret) {
    const expected = base64UrlEncode_(Utilities.computeHmacSha256Signature(signingInput, secret));
    return constantTimeEqual_(normalizedSignature, expected);
  });
  if (!signatureMatches) {
    throw new Error("Assinatura HMAC invalida.");
  }

  const replayKey = "JUS9_REPLAY_" + sha256Hex_(Math.floor(timestamp) + "." + nonce);
  const cache = CacheService.getScriptCache();
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    if (cache.get(replayKey)) {
      throw new Error("Requisicao repetida.");
    }
    cache.put(replayKey, "1", JUS9_DRIVE_SAVER_CONFIG.replayTtlSeconds);
  } finally {
    lock.releaseLock();
  }
}

function validateLegacyInternalKey_(providedKey) {
  const expected = getRequiredSecretProperty_("CHAVE_INTERNA");
  if (!providedKey || !constantTimeEqual_(String(providedKey), expected)) {
    throw new Error("Chave interna invalida.");
  }
}

function canonicalizeSignedRequest_(payload) {
  const canonical = {};
  JUS9_SIGNED_REQUEST_FIELDS.forEach(function(field) {
    const value = payload[field];
    canonical[field] = value === undefined || value === null ? null : value;
  });
  return JSON.stringify(canonical);
}

function normalizeBase64Url_(value) {
  return String(value || "").replace(/=+$/g, "");
}

function base64UrlEncode_(bytes) {
  return normalizeBase64Url_(Utilities.base64EncodeWebSafe(bytes));
}

function constantTimeEqual_(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function sha256Hex_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
  return digest.map(function(byte) {
    const normalized = byte < 0 ? byte + 256 : byte;
    return ("0" + normalized.toString(16)).slice(-2);
  }).join("");
}

function getRequiredSecretProperty_(propertyName) {
  const value = getRequiredScriptProperty_(propertyName);
  if (value.length < JUS9_DRIVE_SAVER_CONFIG.minimumSecretLength) {
    throw new Error(`Segredo ${propertyName} deve ter pelo menos ${JUS9_DRIVE_SAVER_CONFIG.minimumSecretLength} caracteres.`);
  }
  return value;
}

function getCandidateRequestSecrets_() {
  const active = getRequiredSecretProperty_("CHAVE_INTERNA");
  const previous = getOptionalScriptProperty_("JUS9_PREVIOUS_HMAC_KEY");
  if (!previous) return [active];
  if (previous.length < JUS9_DRIVE_SAVER_CONFIG.minimumSecretLength) {
    throw new Error("JUS9_PREVIOUS_HMAC_KEY deve ter pelo menos 32 caracteres.");
  }
  return previous === active ? [active] : [active, previous];
}

function getBooleanScriptProperty_(propertyName, fallback) {
  const value = getOptionalScriptProperty_(propertyName).toLowerCase();
  if (!value) return Boolean(fallback);
  if (["true", "1", "sim", "yes", "on"].indexOf(value) >= 0) return true;
  if (["false", "0", "nao", "não", "no", "off"].indexOf(value) >= 0) return false;
  throw new Error(`Propriedade booleana invalida: ${propertyName}`);
}

function getRequestAuthStatus_() {
  const requireSigned = getBooleanScriptProperty_("JUS9_REQUIRE_SIGNED_REQUESTS", false);
  return {
    scheme: "HMAC-SHA256",
    version: "v1",
    signedRequestsRequired: requireSigned,
    legacyKeyAccepted: !requireSigned && getBooleanScriptProperty_("JUS9_ALLOW_LEGACY_KEY", true),
    scriptProperties: ["CHAVE_INTERNA", "JUS9_PREVIOUS_HMAC_KEY", "JUS9_REQUIRE_SIGNED_REQUESTS", "JUS9_ALLOW_LEGACY_KEY", "JUS9_SIGNING_KEY_ID"]
  };
}

function normalizeRequest_(payload) {
  const titulo = sanitizeTitle_(payload.titulo || "Documento Charlie Echo");
  const conteudo = String(payload.conteudo || "").trim();
  const classificacao = String(payload.classificacao || "INTERNO").toUpperCase().trim();

  if (!conteudo) throw new Error("Conteudo vazio.");
  if (conteudo.length > JUS9_DRIVE_SAVER_CONFIG.maxContentLength) {
    throw new Error("Conteudo muito longo para o MVP inicial.");
  }
  if (!/^[A-Z0-9_]{1,80}$/.test(classificacao)) {
    throw new Error("Classificacao invalida.");
  }

  return {
    titulo,
    conteudo,
    classificacao,
    tipoDocumento: sanitizeMetadata_(payload.tipoDocumento || "MEMORANDO"),
    origem: sanitizeMetadata_(payload.origem || "Charlie Echo / Jus 9"),
    autorOperacional: sanitizeMetadata_(payload.autorOperacional || "Charlie Echo da Costa"),
    observacao: sanitizeMetadata_(payload.observacao || ""),
    criarLinkDownload: Boolean(payload.criarLinkDownload),
    idempotencyKey: normalizeIdempotencyKey_(payload.idempotencyKey),
    conteudoDigest: sha256Hex_(conteudo),
    criadoEm: new Date()
  };
}

function normalizeAction_(action) {
  const normalized = String(action || "CRIAR_DOCUMENTO").toUpperCase().trim();
  const aliases = {
    CRIAR: "CRIAR_DOCUMENTO",
    CRIAR_DOCUMENTO: "CRIAR_DOCUMENTO",
    SALVAR_DOCUMENTO: "CRIAR_DOCUMENTO",
    REVOGAR_LINK_PUBLICO: "RESTRINGIR_LINK_PUBLICO",
    RESTRINGIR_LINK_PUBLICO: "RESTRINGIR_LINK_PUBLICO",
    DESPUBLICAR: "RESTRINGIR_LINK_PUBLICO",
    TIRAR_DO_AR: "RESTRINGIR_LINK_PUBLICO",
    MOVER_PARA_REVISAO: "MOVER_PARA_REVISAO",
    MOVER_REVISAO: "MOVER_PARA_REVISAO",
    RESTRINGIR_E_MOVER_PARA_REVISAO: "RESTRINGIR_E_MOVER_PARA_REVISAO",
    RESTRINGIR_MOVER_REVISAO: "RESTRINGIR_E_MOVER_PARA_REVISAO",
    LIXEIRA: "ENVIAR_LIXEIRA_GOVERNADA",
    ENVIAR_LIXEIRA: "ENVIAR_LIXEIRA_GOVERNADA",
    ENVIAR_LIXEIRA_GOVERNADA: "ENVIAR_LIXEIRA_GOVERNADA",
    APAGAR_GOVERNADO: "ENVIAR_LIXEIRA_GOVERNADA",
    EXCLUIR_GOVERNADO: "ENVIAR_LIXEIRA_GOVERNADA"
  };
  const resolved = aliases[normalized] || normalized;
  const allowed = {
    CRIAR_DOCUMENTO: true,
    RESTRINGIR_LINK_PUBLICO: true,
    MOVER_PARA_REVISAO: true,
    RESTRINGIR_E_MOVER_PARA_REVISAO: true,
    ENVIAR_LIXEIRA_GOVERNADA: true
  };
  if (!allowed[resolved]) throw new Error(`Acao governada nao permitida: ${normalized}`);
  return resolved;
}

function normalizeGovernedActionRequest_(payload, acao) {
  const fileId = sanitizeFileId_(payload.fileId || payload.id || payload.documentId || "");
  if (!fileId) throw new Error("fileId obrigatorio para acao governada.");
  return {
    acao,
    fileId,
    titulo: sanitizeTitle_(payload.titulo || payload.title || "Acao governada Drive Saver"),
    classificacao: "ACAO_GOVERNADA",
    origem: sanitizeMetadata_(payload.origem || "Charlie Echo / Jus 9"),
    autorOperacional: sanitizeMetadata_(payload.autorOperacional || "Charlie Echo da Costa"),
    motivo: sanitizeMetadata_(payload.motivo || payload.observacao || "Correcao governada solicitada pela Charlie Echo."),
    observacao: sanitizeMetadata_(payload.observacao || payload.motivo || ""),
    idempotencyKey: normalizeIdempotencyKey_(payload.idempotencyKey),
    criadoEm: new Date()
  };
}

function normalizeIdempotencyKey_(value) {
  return String(value || "").replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 180);
}

function idempotencyCacheKey_(value) {
  if (!value) return "";
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  const hex = digest.map(function(byte) {
    const normalized = byte < 0 ? byte + 256 : byte;
    return ("0" + normalized.toString(16)).slice(-2);
  }).join("");
  return `JUS9_IDEMPOTENCY_${hex}`;
}

function readIdempotentResult_(value) {
  const key = idempotencyCacheKey_(value);
  if (!key) return null;
  const cached = CacheService.getScriptCache().get(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch (error) {
    return null;
  }
}

function storeIdempotentResult_(value, result) {
  const key = idempotencyCacheKey_(value);
  if (!key || !result) return;
  CacheService.getScriptCache().put(key, JSON.stringify(result), JUS9_DRIVE_SAVER_CONFIG.idempotencyTtlSeconds);
}

function resolveRoute_(classificacao) {
  if (classificacao === "PUBLICO") {
    return {
      folderId: getRequiredFolderId_("PUBLICO"),
      folderName: "01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS",
      reviewRequired: false,
      blocked: false
    };
  }

  if (classificacao === "INTERNO") {
    return {
      folderId: getRequiredFolderId_("INTERNO"),
      folderName: "02_DOCUMENTOS_INTERNOS_JUS9",
      reviewRequired: false,
      blocked: false
    };
  }

  if (classificacao === "JURIDICO_SIGILOSO") {
    return {
      folderId: getRequiredFolderId_("ENTRADA_REVISAO"),
      folderName: "00_ENTRADA_PARA_REVISAO_HUMANA",
      reviewRequired: true,
      blocked: false
    };
  }

  if (classificacao === "COFRE_NAO_AUTOMATICO") {
    return {
      folderId: null,
      folderName: "04_COFRE_NAO_AUTOMATICO",
      reviewRequired: true,
      blocked: true,
      message: "Cofre nao recebe salvamento automatico. Use revisao humana e procedimento proprio."
    };
  }

  if (classificacao === "COFRE_DEPOSITO_ASSISTIDO") {
    return {
      folderId: getRequiredFolderId_("COFRE_DEPOSITO"),
      folderName: "04_COFRE_DEPOSITO_ASSISTIDO",
      reviewRequired: true,
      blocked: false,
      vaultDepositOnly: true
    };
  }

  return {
    folderId: getRequiredFolderId_("ENTRADA_REVISAO"),
    folderName: "00_ENTRADA_PARA_REVISAO_HUMANA",
    reviewRequired: true,
    blocked: false
  };
}

function getRequiredFolderId_(routeKey) {
  const propertyName = JUS9_DRIVE_SAVER_CONFIG.folderPropertyKeys[routeKey];
  if (!propertyName) {
    throw new Error(`Rota de pasta sem propriedade configurada: ${routeKey}`);
  }
  return getRequiredScriptProperty_(propertyName);
}

function getOptionalScriptProperty_(propertyName) {
  const value = PropertiesService.getScriptProperties().getProperty(propertyName);
  return value ? String(value).trim() : "";
}

function getRequiredScriptProperty_(propertyName) {
  const value = PropertiesService.getScriptProperties().getProperty(propertyName);
  if (!value) {
    throw new Error(`Propriedade obrigatoria ausente nas Script Properties: ${propertyName}`);
  }
  return String(value).trim();
}

function createGovernedDocument_(data, route) {
  const timestamp = Utilities.formatDate(data.criadoEm, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const docName = `[${data.classificacao}] ${data.titulo} - ${timestamp}`;
  const doc = DocumentApp.create(docName);
  const body = doc.getBody();

  body.appendParagraph("JUS 9 TECNOLOGIA JURIDICA - CARTORIO DIGITAL CHARLIE ECHO")
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Classificacao: ${data.classificacao}`);
  body.appendParagraph(`Tipo de documento: ${data.tipoDocumento}`);
  body.appendParagraph(`Origem: ${data.origem}`);
  body.appendParagraph(`Autor operacional: ${data.autorOperacional}`);
  body.appendParagraph(`Criado em: ${timestamp}`);
  body.appendParagraph(`Revisao humana obrigatoria: ${route.reviewRequired ? "SIM" : "NAO"}`);
  body.appendParagraph(`Pasta destino: ${route.folderName}`);
  body.appendParagraph(`Digest SHA-256 do conteudo: ${data.conteudoDigest}`);
  if (data.idempotencyKey) body.appendParagraph(`Operacao idempotente: ${data.idempotencyKey}`);
  if (data.observacao) body.appendParagraph(`Observacao: ${data.observacao}`);
  body.appendParagraph("");
  body.appendParagraph("Aviso: documento criado por automacao assistida. Conteudo juridico real, sigiloso ou sensivel exige revisao humana antes de uso externo, publicacao, envio ou arquivamento definitivo.");
  body.appendHorizontalRule();
  body.appendParagraph(data.conteudo);
  doc.saveAndClose();

  const file = DriveApp.getFileById(doc.getId());
  file.moveTo(DriveApp.getFolderById(route.folderId));
  const links = buildGovernedLinks_(file, data, route);

  return {
    fileId: doc.getId(),
    url: links.viewUrl,
    viewUrl: links.viewUrl,
    downloadUrl: links.downloadUrl,
    linkPublicoCriado: links.linkPublicoCriado,
    linkGovernado: links.linkGovernado,
    conteudoDigest: data.conteudoDigest
  };
}

function buildGovernedLinks_(file, data, route) {
  const viewUrl = file.getUrl();
  const requested = Boolean(data.criarLinkDownload);

  if (!requested) {
    return {
      viewUrl,
      downloadUrl: null,
      linkPublicoCriado: false,
      linkGovernado: {
        solicitado: false,
        permitido: false,
        motivo: "link publico nao solicitado"
      }
    };
  }

  if (data.classificacao !== "PUBLICO") {
    return {
      viewUrl,
      downloadUrl: null,
      linkPublicoCriado: false,
      linkGovernado: {
        solicitado: true,
        permitido: false,
        motivo: "somente PUBLICO pode gerar link publico de download"
      }
    };
  }

  if (route.reviewRequired || route.vaultDepositOnly) {
    return {
      viewUrl,
      downloadUrl: null,
      linkPublicoCriado: false,
      linkGovernado: {
        solicitado: true,
        permitido: false,
        motivo: "rota com revisao/cofre nao pode gerar link publico"
      }
    };
  }

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    viewUrl,
    downloadUrl: file.getDownloadUrl() || buildGoogleDocPdfExportUrl_(file.getId()),
    linkPublicoCriado: true,
    linkGovernado: {
      solicitado: true,
      permitido: true,
      motivo: "classificacao PUBLICO autorizada para visualizacao por link"
    }
  };
}

function buildGoogleDocPdfExportUrl_(fileId) {
  return `https://docs.google.com/document/d/${encodeURIComponent(fileId)}/export?format=pdf`;
}

function performGovernedFileAction_(request) {
  const auditId = Utilities.getUuid();
  const file = DriveApp.getFileById(request.fileId);
  assertManagedDriveSaverFile_(file);

  const previousName = file.getName();
  const previousClassification = inferClassificationFromManagedName_(previousName);
  const result = {
    ok: true,
    auditId,
    acaoExecutada: request.acao,
    fileId: request.fileId,
    fileName: previousName,
    classificacaoAnterior: previousClassification,
    motivo: request.motivo,
    downloadUrl: null,
    linkPublicoCriado: false,
    linkGovernado: {
      solicitado: true,
      permitido: false,
      motivo: "acao corretiva governada"
    },
    cofreAutomatico: false,
    cofreDepositoAssistido: false
  };

  if (request.acao === "RESTRINGIR_LINK_PUBLICO") {
    restrictPublicSharing_(file);
    result.status = "LINK_PUBLICO_RESTRINGIDO";
    result.mensagem = "Link publico revogado ou restringido com governanca.";
    result.viewUrl = file.getUrl();
    result.url = result.viewUrl;
    result.pastaDestino = "mantida";
    result.revisaoHumanaObrigatoria = false;
  } else if (request.acao === "MOVER_PARA_REVISAO" || request.acao === "RESTRINGIR_E_MOVER_PARA_REVISAO") {
    restrictPublicSharing_(file);
    file.moveTo(DriveApp.getFolderById(getRequiredFolderId_("ENTRADA_REVISAO")));
    result.status = "MOVIDO_PARA_REVISAO";
    result.mensagem = "Arquivo restringido e movido para revisao humana.";
    result.viewUrl = file.getUrl();
    result.url = result.viewUrl;
    result.pastaDestino = "00_ENTRADA_PARA_REVISAO_HUMANA";
    result.classificacaoFinal = "JURIDICO_SIGILOSO";
    result.revisaoHumanaObrigatoria = true;
  } else if (request.acao === "ENVIAR_LIXEIRA_GOVERNADA") {
    restrictPublicSharing_(file);
    file.setTrashed(true);
    result.status = "LIXEIRA_GOVERNADA";
    result.mensagem = "Arquivo enviado para lixeira governada apos restricao de link publico.";
    result.viewUrl = null;
    result.url = null;
    result.pastaDestino = "LIXEIRA_GOVERNADA";
    result.classificacaoFinal = "LIXEIRA_GOVERNADA";
    result.revisaoHumanaObrigatoria = true;
  } else {
    throw new Error(`Acao governada nao implementada: ${request.acao}`);
  }

  attachAuditRecord_(request, result);
  return result;
}

function restrictPublicSharing_(file) {
  file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
}

function assertManagedDriveSaverFile_(file) {
  const name = file.getName();
  const allowed = /^\[(PUBLICO|INTERNO|JURIDICO_SIGILOSO|COFRE_DEPOSITO_ASSISTIDO)\]\s+/.test(name);
  if (!allowed) {
    throw new Error("Acao recusada: arquivo nao parece ter sido criado pelo Drive Saver.");
  }
  if (!fileBelongsToManagedDriveSaverFolder_(file)) {
    throw new Error("Acao recusada: arquivo nao esta em pasta governada do Drive Saver.");
  }
}

function inferClassificationFromManagedName_(name) {
  const match = String(name || "").match(/^\[([A-Z_]+)\]\s+/);
  return match ? match[1] : "DESCONHECIDA";
}

function fileBelongsToManagedDriveSaverFolder_(file) {
  const allowedFolderIds = getManagedDriveSaverFolderIds_();
  const parents = file.getParents();
  while (parents.hasNext()) {
    const parent = parents.next();
    if (allowedFolderIds[parent.getId()]) return true;
  }
  return false;
}

function getManagedDriveSaverFolderIds_() {
  const ids = {};
  const keys = JUS9_DRIVE_SAVER_CONFIG.folderPropertyKeys;
  for (const routeKey in keys) {
    if (!Object.prototype.hasOwnProperty.call(keys, routeKey)) continue;
    const id = getOptionalScriptProperty_(keys[routeKey]);
    if (id) ids[id] = true;
  }
  return ids;
}

function attachAuditRecord_(request, result) {
  try {
    const timestamp = Utilities.formatDate(request.criadoEm, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const auditPayload = JSON.stringify({
      auditId: result.auditId,
      acao: request.acao,
      status: result.status,
      fileId: request.fileId,
      fileName: result.fileName,
      classificacaoAnterior: result.classificacaoAnterior,
      classificacaoFinal: result.classificacaoFinal || result.classificacaoAnterior,
      pastaDestino: result.pastaDestino,
      origem: request.origem,
      autorOperacional: request.autorOperacional,
      motivo: request.motivo,
      criadoEm: timestamp
    });
    const auditDigest = sha256Hex_(auditPayload);
    const auditKey = getOptionalScriptProperty_("JUS9_AUDIT_HMAC_KEY");
    const auditSignature = auditKey
      ? (auditKey.length >= JUS9_DRIVE_SAVER_CONFIG.minimumSecretLength
        ? base64UrlEncode_(Utilities.computeHmacSha256Signature(auditPayload, auditKey))
        : "")
      : "";
    const doc = DocumentApp.create(`[AUDITORIA] ${result.status} - ${timestamp}`);
    const body = doc.getBody();
    body.appendParagraph("JUS 9 TECNOLOGIA JURIDICA - AUDITORIA DRIVE SAVER")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(`AuditId: ${result.auditId}`);
    body.appendParagraph(`Acao: ${request.acao}`);
    body.appendParagraph(`Status: ${result.status}`);
    body.appendParagraph(`FileId: ${request.fileId}`);
    body.appendParagraph(`Nome do arquivo: ${result.fileName}`);
    body.appendParagraph(`Classificacao anterior: ${result.classificacaoAnterior}`);
    body.appendParagraph(`Classificacao final: ${result.classificacaoFinal || result.classificacaoAnterior}`);
    body.appendParagraph(`Pasta destino: ${result.pastaDestino}`);
    body.appendParagraph(`Origem: ${request.origem}`);
    body.appendParagraph(`Autor operacional: ${request.autorOperacional}`);
    body.appendParagraph(`Motivo: ${request.motivo}`);
    body.appendParagraph(`Criado em: ${timestamp}`);
    body.appendParagraph(`Digest SHA-256 do registro: ${auditDigest}`);
    body.appendParagraph(`Assinatura HMAC do registro: ${auditSignature || "PENDENTE_CHAVE_AUDITORIA"}`);
    body.appendParagraph(`Identificador da chave de auditoria: ${getOptionalScriptProperty_("JUS9_SIGNING_KEY_ID") || "NAO_CONFIGURADO"}`);
    body.appendParagraph("Observacao: registro sem conteudo do documento original, sem chaves e sem segredos.");
    doc.saveAndClose();

    const auditFile = DriveApp.getFileById(doc.getId());
    auditFile.moveTo(DriveApp.getFolderById(getRequiredFolderId_("ENTRADA_REVISAO")));
    result.auditFileId = doc.getId();
    result.auditUrl = auditFile.getUrl();
    result.auditDigest = auditDigest;
    result.auditSigned = Boolean(auditSignature);
    if (auditKey && !auditSignature) result.auditError = "JUS9_AUDIT_HMAC_KEY invalida ou curta.";
  } catch (error) {
    result.auditError = String(error && error.message ? error.message : error);
  }
}

function sanitizeFileId_(fileId) {
  const value = String(fileId || "").trim();
  if (!/^[A-Za-z0-9_-]{20,}$/.test(value)) return "";
  return value;
}

function sanitizeTitle_(title) {
  return String(title)
    .replace(/[\\/:*?"<>|#%{}~&]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "Documento Charlie Echo";
}

function sanitizeMetadata_(value) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, JUS9_DRIVE_SAVER_CONFIG.maxMetadataLength);
}

function logSafe_(status, data, route, fileId, auditId) {
  Logger.log(JSON.stringify({
    status,
    acao: data.acao || "CRIAR_DOCUMENTO",
    auditId: auditId || null,
    titulo: data.titulo,
    classificacao: data.classificacao,
    pastaDestino: route.folderName,
    origem: data.origem,
    fileId: fileId || null,
    criadoEm: data.criadoEm.toISOString()
  }));
}

function json_(obj, statusCode) {
  if (statusCode) obj.statusCode = statusCode;
  const output = ContentService.createTextOutput(JSON.stringify(obj, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
  // Apps Script Web Apps nao permitem setar status HTTP diretamente no ContentService.
  // Mantemos statusCode no JSON quando necessario.
  return output;
}

function sanitizeErrorMessage_(error) {
  let message = String(error && error.message ? error.message : error);
  const propertyNames = ["CHAVE_INTERNA", "JUS9_PREVIOUS_HMAC_KEY", "JUS9_AUDIT_HMAC_KEY", "JUS9_FOLDER_ENTRADA_REVISAO", "JUS9_FOLDER_PUBLICO", "JUS9_FOLDER_INTERNO", "JUS9_FOLDER_COFRE_DEPOSITO"];
  propertyNames.forEach(function(propertyName) {
    const value = getOptionalScriptProperty_(propertyName);
    if (value) message = message.split(value).join("[REDACTED]");
  });
  return message.slice(0, 300);
}
