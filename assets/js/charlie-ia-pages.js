(function(){
  function qs(id){ return document.getElementById(id); }
  function setText(el, text){ if(el) el.textContent = text; }

  var voicePreference = 'auto';
  var attachmentState = { student: [], prof: [] };
  var pdfJsPromise = null;

  function getVoices(){
    if(!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function scoreVoice(voice){
    var name = (voice.name || '').toLowerCase();
    var lang = (voice.lang || '').toLowerCase();
    var score = 0;
    if(lang === 'pt-br') score += 50;
    else if(lang.indexOf('pt') === 0) score += 30;
    if(name.indexOf('francisca') >= 0) score += 120;
    if(name.indexOf('maria') >= 0) score += 105;
    if(name.indexOf('luciana') >= 0) score += 90;
    if(name.indexOf('helena') >= 0) score += 85;
    if(name.indexOf('female') >= 0 || name.indexOf('feminina') >= 0 || name.indexOf('woman') >= 0 || name.indexOf('mulher') >= 0) score += 50;
    if(name.indexOf('google') >= 0 && lang.indexOf('pt') === 0) score += 35;
    if(name.indexOf('microsoft') >= 0 && lang.indexOf('pt') === 0) score += 30;
    if(name.indexOf('daniel') >= 0 || name.indexOf('antonio') >= 0 || name.indexOf('male') >= 0 || name.indexOf('mascul') >= 0) score -= 150;
    return score;
  }

  function chooseBestVoice(){
    var voices = getVoices();
    if(!voices.length) return null;
    if(voicePreference && voicePreference !== 'auto'){
      var chosen = voices.find(function(v){ return v.name === voicePreference; });
      if(chosen) return chosen;
    }
    var pt = voices.filter(function(v){ return (v.lang || '').toLowerCase().indexOf('pt') === 0; });
    var pool = pt.length ? pt : voices;
    return pool.sort(function(a,b){ return scoreVoice(b) - scoreVoice(a); })[0] || null;
  }

  function populateVoiceSelects(){
    var voices = getVoices();
    document.querySelectorAll('[data-voice-select]').forEach(function(sel){
      var current = sel.value || voicePreference || 'auto';
      sel.innerHTML = '';
      var auto = document.createElement('option');
      auto.value = 'auto';
      auto.textContent = 'Preferir voz feminina pt-BR';
      sel.appendChild(auto);
      voices
        .filter(function(v){ return (v.lang || '').toLowerCase().indexOf('pt') === 0; })
        .sort(function(a,b){ return scoreVoice(b) - scoreVoice(a); })
        .forEach(function(v){
          var opt = document.createElement('option');
          opt.value = v.name;
          opt.textContent = v.name + ' — ' + v.lang;
          sel.appendChild(opt);
        });
      sel.value = Array.from(sel.options).some(function(o){ return o.value === current; }) ? current : 'auto';
      sel.onchange = function(){ voicePreference = sel.value || 'auto'; };
    });
  }

  function initVoiceSystem(){
    populateVoiceSelects();
    if('speechSynthesis' in window){
      window.speechSynthesis.onvoiceschanged = populateVoiceSelects;
      setTimeout(populateVoiceSelects, 250);
      setTimeout(populateVoiceSelects, 1000);
    }
  }

  function copyText(text, feedbackEl){
    if(!text) text = '';
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text)
        .then(function(){ if(feedbackEl) feedbackEl.textContent = 'Conteúdo copiado para a área de transferência.'; })
        .catch(function(){ if(feedbackEl) feedbackEl.textContent = 'Não foi possível copiar automaticamente. Copie manualmente.'; });
    }
    if(feedbackEl) feedbackEl.textContent = 'Seu navegador não permitiu a cópia automática. Copie manualmente.';
    return Promise.resolve();
  }

  function speakText(text, statusEl){
    if(!('speechSynthesis' in window)){
      if(statusEl) statusEl.textContent = 'Leitura em voz alta não disponível neste navegador.';
      return;
    }
    populateVoiceSelects();
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text || 'Não há texto para leitura.');
    utter.lang = 'pt-BR';
    utter.rate = 1;
    utter.pitch = 1.10;
    var selected = chooseBestVoice();
    if(selected) utter.voice = selected;
    utter.onstart = function(){ if(statusEl) statusEl.textContent = 'Leitura iniciada com voz da Charlie' + (selected ? ': ' + selected.name : ' padrão do navegador') + '.'; };
    utter.onend = function(){ if(statusEl) statusEl.textContent = 'Leitura em voz alta concluída.'; };
    utter.onerror = function(){ if(statusEl) statusEl.textContent = 'Não foi possível concluir a leitura em voz alta.'; };
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking(statusEl){
    if('speechSynthesis' in window){
      window.speechSynthesis.cancel();
      if(statusEl) statusEl.textContent = 'Leitura em voz alta interrompida.';
    }
  }

  function slugify(text){
    return (text || 'charlie-echo').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'charlie-echo';
  }

  function timestamp(){
    var d = new Date();
    var p = function(n){ return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + '-' + p(d.getMinutes());
  }

  function downloadBlob(filename, content, type, statusEl){
    var blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 500);
    if(statusEl) statusEl.textContent = 'Arquivo preparado para download: ' + filename;
  }

  function buildMarkdown(title, body, kind){
    var now = new Date().toLocaleString('pt-BR');
    return '# ' + title + '\n\n- Tipo: ' + kind + '\n- Gerado em: ' + now + '\n- Origem: Charlie Echo da Costa — Jus 9 Tecnologia Jurídica\n\n## Conteúdo\n\n' + (body || 'Sem conteúdo no momento.') + '\n';
  }

  function downloadResponse(text, kind, ext, statusEl){
    var safe = (text || '').trim();
    if(!safe){ if(statusEl) statusEl.textContent = 'Não há conteúdo suficiente para baixar.'; return; }
    var base = slugify(kind) + '_' + timestamp();
    if(ext === 'md') return downloadBlob(base + '.md', buildMarkdown(kind, safe, kind), 'text/markdown;charset=utf-8', statusEl);
    return downloadBlob(base + '.txt', safe, 'text/plain;charset=utf-8', statusEl);
  }

  function showDownloadMenu(button, text, kind, statusEl){
    var old = document.querySelector('.download-popover'); if(old) old.remove();
    var menu = document.createElement('div');
    menu.className = 'download-popover';
    menu.innerHTML = '<button type="button" data-format="txt">Baixar .txt</button><button type="button" data-format="md">Baixar .md</button><button type="button" data-format="link">Gerar link futuramente</button>';
    document.body.appendChild(menu);
    var rect = button.getBoundingClientRect();
    menu.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    menu.addEventListener('click', function(ev){
      var fmt = ev.target.getAttribute('data-format'); if(!fmt) return;
      if(fmt === 'link'){
        if(statusEl) statusEl.textContent = 'Link real de download depende da rota /api/gerar-download com armazenamento. Por enquanto, use .txt ou .md local.';
      } else {
        downloadResponse(text, kind, fmt, statusEl);
      }
      menu.remove();
    });
    setTimeout(function(){
      document.addEventListener('click', function close(ev){
        if(!menu.contains(ev.target) && ev.target !== button){ menu.remove(); document.removeEventListener('click', close); }
      });
    }, 0);
  }

  function extractAnswer(data){
    if(!data) return '';
    if(typeof data === 'string') return data.trim();
    var candidates = [data.answer, data.resposta, data.response, data.output_text, data.text, data.content, data.message];
    for(var i=0;i<candidates.length;i++){ if(typeof candidates[i] === 'string' && candidates[i].trim()) return candidates[i].trim(); }
    if(Array.isArray(data.choices)){
      var msg = data.choices[0] && data.choices[0].message && data.choices[0].message.content; if(typeof msg === 'string' && msg.trim()) return msg.trim();
      var txt = data.choices[0] && data.choices[0].text; if(typeof txt === 'string' && txt.trim()) return txt.trim();
    }
    if(Array.isArray(data.output)){
      var parts = [];
      data.output.forEach(function(item){ if(Array.isArray(item.content)){ item.content.forEach(function(c){ if(c && typeof c.text === 'string') parts.push(c.text); }); }});
      var joined = parts.join('\n\n').trim(); if(joined) return joined;
    }
    return '';
  }

  async function callCharlieApi(message, mode, statusEl){
    var endpoints = ['/api/ia', '/work/api/ia', '/api/work/ia'];
    var lastError = null;
    for(var i=0;i<endpoints.length;i++){
      var endpoint = endpoints[i];
      try{
        if(statusEl) statusEl.textContent = 'Conectando Charlie Echo em ' + endpoint + '...';
        var res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: message, mode: mode }) });
        var raw = await res.text();
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch(e) { data = { answer: raw }; }
        var answer = extractAnswer(data);
        if(res.ok && answer){ if(statusEl) statusEl.textContent = 'Resposta recebida da Charlie Echo.'; return answer; }
        lastError = (data && (data.error || data.message || data.detail)) || raw || ('Endpoint respondeu com status ' + res.status);
        if(res.status !== 404) break;
      }catch(err){ lastError = err && err.message ? err.message : 'Falha de conexão.'; }
    }
    if(statusEl) statusEl.textContent = 'API indisponível ou sem resposta textual reconhecida: ' + (lastError || 'sem detalhes') + '. Mantive resposta local segura.';
    return null;
  }

  function startVoiceInput(targetInput, statusEl){
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){ if(statusEl) statusEl.textContent = 'Entrada por voz não disponível neste navegador. Use Chrome/Edge para testar.'; return; }
    var rec = new SpeechRecognition();
    rec.lang = 'pt-BR'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = function(){ if(statusEl) statusEl.textContent = 'Ouvindo... fale agora.'; };
    rec.onerror = function(ev){ if(statusEl) statusEl.textContent = 'Não foi possível captar sua voz: ' + ev.error + '.'; };
    rec.onresult = function(ev){
      var transcript = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
      if(targetInput){ targetInput.value = (targetInput.value ? targetInput.value + ' ' : '') + transcript; targetInput.focus(); }
      if(statusEl) statusEl.textContent = 'Entrada por voz capturada com sucesso.';
    };
    rec.start();
  }

  function clearWorkspace(input, resposta, status, defaultText){
    stopSpeaking();
    if(input){ input.value = ''; input.focus(); }
    if(resposta) resposta.textContent = defaultText || 'Área limpa e pronta para nova consulta.';
    if(status) status.textContent = 'Tela limpa. Digite uma nova pergunta.';
    var scope = document.body.dataset.page === 'professional' ? 'prof' : 'student';
    attachmentState[scope] = [];
    var fileInput = document.querySelector('[data-attach-input="' + scope + '"]');
    if(fileInput) fileInput.value = '';
    renderAttachments(scope);
  }

  function bindEnterToSubmit(input, button, status){
    if(!input || !button) return;
    input.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' && !ev.shiftKey){
        ev.preventDefault();
        button.click();
        if(status) status.textContent = 'Enter acionou o envio.';
      }
      if((ev.ctrlKey || ev.metaKey) && (ev.key || '').toLowerCase() === 'l'){
        ev.preventDefault();
        var clearBtn = document.querySelector('[data-student-action="limpar"], [data-prof-action="limpar"]');
        if(clearBtn) clearBtn.click();
      }
    });
  }

  function formatSize(bytes){
    if(!bytes) return '0 KB';
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return Math.ceil(bytes/1024) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  }

  function isTextLike(file){
    var name = (file.name || '').toLowerCase();
    var type = (file.type || '').toLowerCase();
    return type.indexOf('text/') === 0 || /\.(txt|md|markdown|csv|json|html|css|js|ts|xml|yml|yaml)$/i.test(name);
  }

  function isPdf(file){
    var name = (file.name || '').toLowerCase();
    var type = (file.type || '').toLowerCase();
    return type === 'application/pdf' || /\.pdf$/i.test(name);
  }

  function readFileAsText(file){
    return new Promise(function(resolve){
      var reader = new FileReader();
      reader.onload = function(){ resolve(String(reader.result || '').slice(0, 60000)); };
      reader.onerror = function(){ resolve(''); };
      reader.readAsText(file);
    });
  }

  function readFileAsArrayBuffer(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(){ resolve(reader.result); };
      reader.onerror = function(){ reject(reader.error || new Error('Falha ao ler arquivo.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  function ensurePdfJs(){
    if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if(pdfJsPromise) return pdfJsPromise;
    pdfJsPromise = new Promise(function(resolve, reject){
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = function(){
        if(window.pdfjsLib){
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        } else reject(new Error('PDF.js não carregou.'));
      };
      script.onerror = function(){ reject(new Error('Não foi possível carregar PDF.js.')); };
      document.head.appendChild(script);
    });
    return pdfJsPromise;
  }

  async function readPdfText(file){
    try{
      var pdfjs = await ensurePdfJs();
      var data = await readFileAsArrayBuffer(file);
      var pdf = await pdfjs.getDocument({ data: data }).promise;
      var pages = [];
      var maxPages = Math.min(pdf.numPages, 40);
      for(var pageNum=1; pageNum<=maxPages; pageNum++){
        var page = await pdf.getPage(pageNum);
        var content = await page.getTextContent();
        var text = content.items.map(function(item){ return item.str || ''; }).join(' ').replace(/\s+/g, ' ').trim();
        if(text) pages.push('[Página ' + pageNum + ']\n' + text);
      }
      var joined = pages.join('\n\n').trim();
      if(!joined) return { text:'', note:'PDF sem texto extraível localmente. Pode ser scanner/imagem e exigir OCR.' };
      if(pdf.numPages > maxPages) joined += '\n\n[Observação: foram lidas as primeiras ' + maxPages + ' páginas de ' + pdf.numPages + '.]';
      return { text: joined.slice(0, 90000), note:'PDF textual lido localmente com PDF.js.' };
    }catch(err){
      return { text:'', note:'Não foi possível extrair texto do PDF localmente: ' + (err && err.message ? err.message : 'erro desconhecido') + '.' };
    }
  }

  function renderAttachments(scope){
    var list = document.querySelector('[data-attachment-list="' + scope + '"]');
    var files = attachmentState[scope] || [];
    if(!list) return;
    if(!files.length){ list.textContent = 'Nenhum arquivo anexado.'; return; }
    list.innerHTML = files.map(function(item){
      var status = item.text ? 'conteúdo lido' : 'registrado';
      if(item.note) status += ' · ' + item.note;
      return '<span class="attachment-pill">📎 ' + escapeHtml(item.name) + ' · ' + formatSize(item.size) + ' · ' + escapeHtml(status) + '</span>';
    }).join('');
  }

  function escapeHtml(text){
    return String(text || '').replace(/[&<>"]/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]); });
  }

  async function processAttachment(file, statusEl){
    var item = { name:file.name, size:file.size, type:file.type, text:'', note:'' };
    if(isTextLike(file)){
      item.text = await readFileAsText(file);
      item.note = item.text ? 'texto lido localmente' : 'não foi possível ler texto';
      return item;
    }
    if(isPdf(file)){
      if(statusEl) statusEl.textContent = 'Lendo PDF localmente: ' + file.name + '...';
      var pdf = await readPdfText(file);
      item.text = pdf.text;
      item.note = pdf.note;
      return item;
    }
    item.note = 'tipo complexo; análise completa exige upload seguro/backend apropriado';
    return item;
  }

  function bindAttachments(scope, statusEl){
    var btn = document.querySelector('[data-attach-button="' + scope + '"]');
    var input = document.querySelector('[data-attach-input="' + scope + '"]');
    if(!btn || !input) return;
    btn.onclick = function(){ input.click(); };
    input.onchange = async function(){
      var selected = Array.prototype.slice.call(input.files || []);
      attachmentState[scope] = [];
      renderAttachments(scope);
      if(!selected.length){ if(statusEl) statusEl.textContent = 'Nenhum arquivo anexado.'; return; }
      if(statusEl) statusEl.textContent = 'Processando ' + selected.length + ' arquivo(s) anexado(s)...';
      for(var i=0; i<selected.length; i++){
        var item = await processAttachment(selected[i], statusEl);
        attachmentState[scope].push(item);
        renderAttachments(scope);
      }
      var readCount = attachmentState[scope].filter(function(f){ return f.text; }).length;
      if(statusEl) statusEl.textContent = selected.length + ' arquivo(s) anexado(s). ' + readCount + ' com texto disponível para a Charlie Echo.';
    };
  }

  function buildMessageWithAttachments(message, scope){
    var files = attachmentState[scope] || [];
    if(!files.length) return message;
    var parts = [message, '\n\n[ANEXOS PROCESSADOS LOCALMENTE]'];
    files.forEach(function(file, idx){
      parts.push('\nAnexo ' + (idx+1) + ': ' + file.name + ' (' + formatSize(file.size) + ')');
      parts.push('Status: ' + (file.note || (file.text ? 'conteúdo lido' : 'sem texto extraído')));
      if(file.text) parts.push('Conteúdo textual extraído:\n' + file.text.slice(0, 50000));
      else parts.push('Sem conteúdo textual extraído. Se for PDF escaneado/imagem, será necessário OCR ou transcrição.');
    });
    return parts.join('\n');
  }

  function initStudent(){
    var input = qs('pergunta-estudante'), resposta = qs('resposta-estudante'), status = qs('status-estudante');
    var perguntarBtn = document.querySelector('[data-student-action="perguntar"]');
    bindEnterToSubmit(input, perguntarBtn, status);
    bindAttachments('student', status);
    var exemplos = ['Explique o que é cidadania em linguagem simples.','Resuma este texto em três tópicos: [cole o texto aqui].','Me dê cinco temas de estudo sobre Direito e tecnologia.','Crie um roteiro de estudos de 30 minutos sobre LGPD.'];
    var temas = ['Direito e tecnologia','LGPD e privacidade','Cidadania digital','Inteligência artificial responsável','Organização de estudos','Ética no uso da IA'];
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ setText(resposta, text); }
    document.querySelectorAll('[data-student-action]').forEach(function(btn){ btn.addEventListener('click', function(){
      var ac = btn.getAttribute('data-student-action'), t = currentText();
      if(ac === 'falar') return startVoiceInput(input, status);
      if(ac === 'perguntar'){
        if(!t && !(attachmentState.student || []).length) return answer('Digite, fale ou anexe um conteúdo para estudar.');
        var msg = buildMessageWithAttachments(t || 'Analise os anexos enviados e explique de forma didática.', 'student');
        callCharlieApi(msg, 'estudantes', status).then(function(apiAnswer){ answer(apiAnswer || 'Resposta educativa local: recebi sua solicitação, mas a API ainda não respondeu com texto reconhecido neste ambiente.'); });
        return;
      }
      if(ac === 'exemplos'){ if(input) input.value = exemplos.join('\n'); answer('Exemplos preenchidos na caixa de estudo.'); return; }
      if(ac === 'temas') return answer('Temas sugeridos: ' + temas.join('; ') + '.');
      if(ac === 'resumir') return answer(t ? 'Resumo orientativo: 1) identifique a ideia central; 2) destaque os argumentos principais; 3) registre a conclusão em linguagem simples.' : 'Cole ou anexe um texto para preparar um resumo orientativo.');
      if(ac === 'documento') return answer('Anexe um documento textual ou PDF pesquisável. A Charlie tentará ler o texto localmente; PDF escaneado exige OCR.');
      if(ac === 'imagem') return answer('Análise de imagem exige função multimodal/upload seguro futuro. Descreva a imagem ou envie texto extraído.');
      if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
      if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'resposta-estudantes-charlie-echo', status);
      if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
      if(ac === 'parar') return stopSpeaking(status);
      if(ac === 'traduzir') return answer('Tradução preparada como função futura. Na versão pública atual, a página registra apenas a intenção e preserva seus dados no navegador.');
      if(ac === 'simplificar') return answer(t ? 'Versão simplificada: explique o assunto com frases curtas, uma ideia por vez e um exemplo concreto.' : 'Escreva ou anexe um texto para simplificar.');
      if(ac === 'avaliar') return setText(status, 'Feedback local registrado: em versão futura, esta ação poderá enviar avaliação sem dados sensíveis.');
      if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Área preparada para resposta da IA. Enter envia; Shift+Enter quebra linha; Ctrl+L limpa.');
    }); });
  }

  function initProfessional(){
    var input = qs('consulta-profissional'), resposta = qs('resposta-profissional'), status = qs('status-profissional');
    var consultarBtn = document.querySelector('[data-prof-action="consultar"]');
    bindEnterToSubmit(input, consultarBtn, status);
    bindAttachments('prof', status);
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ setText(resposta, text); }
    document.querySelectorAll('[data-prof-action]').forEach(function(btn){ btn.addEventListener('click', function(){
      var ac = btn.getAttribute('data-prof-action'), t = currentText();
      if(ac === 'falar') return startVoiceInput(input, status);
      if(ac === 'consultar'){
        if(!t && !(attachmentState.prof || []).length) return answer('Digite, fale ou anexe um documento para análise.');
        var msg = buildMessageWithAttachments(t || 'Analise os anexos enviados com cautela jurídico-assistiva.', 'prof');
        callCharlieApi(msg, 'profissional', status).then(function(apiAnswer){ answer(apiAnswer || 'Consulta local: recebi sua solicitação, mas a API ainda não respondeu com texto reconhecido neste ambiente.'); });
        return;
      }
      if(ac === 'peticao') return answer('Análise de petição: anexe o texto/PDF pesquisável da peça ou cole o conteúdo. A leitura local não substitui revisão humana habilitada.');
      if(ac === 'resumir') return answer(t ? 'Resumo do caso: fatos essenciais, questão jurídica, tese central, risco principal e próximo passo sugerido.' : 'Descreva o caso ou anexe documento para preparar resumo objetivo.');
      if(ac === 'revisar') return answer('Revisão documental: anexe documento textual/PDF pesquisável ou cole o texto. Documentos sigilosos exigem ambiente seguro adequado.');
      if(ac === 'juris') return answer('Jurisprudência: busque tribunal, tema, palavras-chave, período e entendimento que deseja comparar.');
      if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
      if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'documento-profissional-charlie-echo', status);
      if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
      if(ac === 'parar') return stopSpeaking(status);
      if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Área preparada para resposta jurídico-orientada. Enter consulta; Shift+Enter quebra linha; Ctrl+L limpa.');
    }); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initVoiceSystem();
    if(document.body.dataset.page === 'student') initStudent();
    if(document.body.dataset.page === 'professional') initProfessional();
  });
})();
