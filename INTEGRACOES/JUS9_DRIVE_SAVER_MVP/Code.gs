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
 * CHAVE_INTERNA = valor definido pelo Fundador nas Propriedades do script.
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
  idempotencyTtlSeconds: 21600
};

function doGet() {
  return json_({
    ok: true,
    service: "JUS9_DRIVE_SAVER_MVP",
    message: "Servico ativo. Use POST com chave interna e dados do documento.",
    cofreAutomatico: false,
    requiredScriptProperties: [
      "CHAVE_INTERNA",
      "JUS9_FOLDER_ENTRADA_REVISAO",
      "JUS9_FOLDER_PUBLICO",
      "JUS9_FOLDER_INTERNO"
    ],
    optionalScriptProperties: [
      "JUS9_FOLDER_COFRE_DEPOSITO"
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
  try {
    const payload = parsePayload_(e);
    validateInternalKey_(payload.chaveInterna);
    const acao = normalizeAction_(payload.acao || payload.action || "CRIAR_DOCUMENTO");
    const idempotencyKey = normalizeIdempotencyKey_(payload.idempotencyKey);
    const previousResult = readIdempotentResult_(idempotencyKey);
    if (previousResult) {
      return json_(Object.assign({}, previousResult, {
        idempotentReplay: true,
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
      return json_(actionResult);
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
      classificacaoFinal: normalized.classificacao,
      pastaDestino: route.folderName,
      revisaoHumanaObrigatoria: route.reviewRequired,
      cofreAutomatico: false,
      cofreDepositoAssistido: Boolean(route.vaultDepositOnly)
    };
    storeIdempotentResult_(idempotencyKey, result);
    return json_(result);
  } catch (error) {
    return json_({
      ok: false,
      mensagem: "Falha no salvamento governado.",
      erro: String(error && error.message ? error.message : error)
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
  return JSON.parse(e.postData.contents);
}

function validateInternalKey_(providedKey) {
  const expected = getRequiredScriptProperty_("CHAVE_INTERNA");
  if (!providedKey || String(providedKey) !== expected) {
    throw new Error("Chave interna invalida.");
  }
}

function normalizeRequest_(payload) {
  const titulo = sanitizeTitle_(payload.titulo || "Documento Charlie Echo");
  const conteudo = String(payload.conteudo || "").trim();
  const classificacao = String(payload.classificacao || "INTERNO").toUpperCase().trim();

  if (!conteudo) throw new Error("Conteudo vazio.");
  if (conteudo.length > JUS9_DRIVE_SAVER_CONFIG.maxContentLength) {
    throw new Error("Conteudo muito longo para o MVP inicial.");
  }

  return {
    titulo,
    conteudo,
    classificacao,
    tipoDocumento: String(payload.tipoDocumento || "MEMORANDO").trim(),
    origem: String(payload.origem || "Charlie Echo / Jus 9").trim(),
    autorOperacional: String(payload.autorOperacional || "Charlie Echo da Costa").trim(),
    observacao: String(payload.observacao || "").trim(),
    criarLinkDownload: Boolean(payload.criarLinkDownload),
    idempotencyKey: normalizeIdempotencyKey_(payload.idempotencyKey),
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
    origem: String(payload.origem || "Charlie Echo / Jus 9").trim(),
    autorOperacional: String(payload.autorOperacional || "Charlie Echo da Costa").trim(),
    motivo: String(payload.motivo || payload.observacao || "Correcao governada solicitada pela Charlie Echo.").trim().slice(0, 500),
    observacao: String(payload.observacao || payload.motivo || "").trim().slice(0, 500),
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
    linkGovernado: links.linkGovernado
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
    body.appendParagraph("Observacao: registro sem conteudo do documento original, sem chaves e sem segredos.");
    doc.saveAndClose();

    const auditFile = DriveApp.getFileById(doc.getId());
    auditFile.moveTo(DriveApp.getFolderById(getRequiredFolderId_("ENTRADA_REVISAO")));
    result.auditFileId = doc.getId();
    result.auditUrl = auditFile.getUrl();
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
