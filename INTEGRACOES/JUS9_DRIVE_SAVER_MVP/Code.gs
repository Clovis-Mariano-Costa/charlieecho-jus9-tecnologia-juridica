/**
 * JUS9_DRIVE_SAVER_MVP
 * Mini-backend gratuito em Google Apps Script para salvar documentos da Charlie Echo.
 *
 * Regra maior:
 * - Nao pedir senha Google.
 * - Nao salvar token, chave, .env ou segredo.
 * - Nao escrever em 04_COFRE_NAO_AUTOMATICO.
 * - Nao editar, excluir ou sobrescrever arquivos existentes.
 * - Criar sempre novo documento com cabecalho de classificacao.
 *
 * Script Property obrigatoria:
 * CHAVE_INTERNA = valor definido pelo Fundador nas Propriedades do script.
 */

const JUS9_DRIVE_SAVER_CONFIG = {
  rootFolderId: "1rRNzoKWBI5F9WnrMeyQ_4WkloOsuxFCU",
  folders: {
    ENTRADA_REVISAO: "18ZQ6wTt7ozq4T5WOYwD1a6qE-Ku8BW7p",
    PUBLICO: "1kcED48ZFCxfjYGqJ00BeVY4qLLKnu66A",
    INTERNO: "1ei51Mh86Wi1DUPgC3BFAdlZ_ELWfhYeO",
    JURIDICO_SIGILOSO: "1LNcAVGomfZTOzjCKfZXve3yoRLoO2Dkw",
    COFRE_NAO_AUTOMATICO: "1LxmQwo9993s4dXumc5AoHfBTirDCAb9k"
  },
  maxContentLength: 90000
};

function doGet() {
  return json_({
    ok: true,
    service: "JUS9_DRIVE_SAVER_MVP",
    message: "Servico ativo. Use POST com chave interna e dados do documento.",
    cofreAutomatico: false
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
      classificacaoFinal: normalized.classificacao,
      pastaDestino: route.folderName,
      revisaoHumanaObrigatoria: route.reviewRequired,
      cofreAutomatico: false
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
  const expected = PropertiesService.getScriptProperties().getProperty("CHAVE_INTERNA");
  if (!expected) {
    throw new Error("CHAVE_INTERNA nao configurada nas Propriedades do script.");
  }
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
    criadoEm: new Date()
  };
}

function resolveRoute_(classificacao) {
  if (classificacao === "PUBLICO") {
    return {
      folderId: JUS9_DRIVE_SAVER_CONFIG.folders.PUBLICO,
      folderName: "01_DOCUMENTOS_PUBLICOS_E_EDUCATIVOS",
      reviewRequired: false,
      blocked: false
    };
  }

  if (classificacao === "INTERNO") {
    return {
      folderId: JUS9_DRIVE_SAVER_CONFIG.folders.INTERNO,
      folderName: "02_DOCUMENTOS_INTERNOS_JUS9",
      reviewRequired: false,
      blocked: false
    };
  }

  if (classificacao === "JURIDICO_SIGILOSO") {
    return {
      folderId: JUS9_DRIVE_SAVER_CONFIG.folders.ENTRADA_REVISAO,
      folderName: "00_ENTRADA_PARA_REVISAO_HUMANA",
      reviewRequired: true,
      blocked: false
    };
  }

  if (classificacao === "COFRE_NAO_AUTOMATICO") {
    return {
      folderId: JUS9_DRIVE_SAVER_CONFIG.folders.COFRE_NAO_AUTOMATICO,
      folderName: "04_COFRE_NAO_AUTOMATICO",
      reviewRequired: true,
      blocked: true,
      message: "Cofre nao recebe salvamento automatico. Use revisao humana e procedimento proprio."
    };
  }

  return {
    folderId: JUS9_DRIVE_SAVER_CONFIG.folders.ENTRADA_REVISAO,
    folderName: "00_ENTRADA_PARA_REVISAO_HUMANA",
    reviewRequired: true,
    blocked: false
  };
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

  return {
    fileId: doc.getId(),
    url: doc.getUrl()
  };
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
