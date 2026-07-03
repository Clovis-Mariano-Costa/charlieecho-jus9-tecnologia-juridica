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
  maxContentLength: 90000
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
    linkDownloadGovernado: "Use criarLinkDownload=true somente para classificacao PUBLICO."
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validateInternalKey_(payload.chaveInterna);

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

    return json_({
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
    });
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
    criadoEm: new Date()
  };
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

function sanitizeTitle_(title) {
  return String(title)
    .replace(/[\\/:*?"<>|#%{}~&]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "Documento Charlie Echo";
}

function logSafe_(status, data, route, fileId) {
  Logger.log(JSON.stringify({
    status,
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
