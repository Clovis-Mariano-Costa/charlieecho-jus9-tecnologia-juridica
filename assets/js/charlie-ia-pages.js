(function(){
  function qs(id){ return document.getElementById(id); }
  function setText(el, text){ if(el) el.textContent = text; }
  function renderAnswer(el, text){
    if(!el) return;
    var safe = escapeHtml(text || '');
    el.innerHTML = safe
      .replace(/https:\/\/[^\s<>"']+/g, function(raw){
        var url = raw, suffix = '';
        while(/[),.;:!?]$/.test(url)){ suffix = url.slice(-1) + suffix; url = url.slice(0, -1); }
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>' + suffix;
      })
      .replace(/\n/g, '<br>');
  }

  var storedVoicePreference = localStorage.getItem('charlieEchoVoicePreference');
  var voicePreferenceVersion = localStorage.getItem('charlieEchoVoicePreferenceVersion');
  var voicePreference = (!storedVoicePreference || (storedVoicePreference === 'auto' && voicePreferenceVersion !== '2')) ? 'feminina-pt-br' : storedVoicePreference;
  var attachmentState = { student: [], prof: [] };
  var pdfJsPromise = null;
  function externalLinksGuidance(){
    return 'Diga qual site, orgao, tribunal, universidade, servico ou material publico voce procura. A Charlie Echo avaliara o contexto e priorizara fontes oficiais ou institucionais confiaveis, sem limitar a resposta a um catalogo fixo. URLs HTTPS aprovadas aparecem como links clicaveis. Conteudo sigiloso, secreto ou de cofre nao recebe link publico.';
  }

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
    if(name.indexOf('portugu') >= 0 && name.indexOf('brasil') >= 0) score += 38;
    if(name.indexOf('samsung') >= 0 && lang.indexOf('pt') === 0) score += 34;
    if(name.indexOf('francisca') >= 0) score += 160;
    if(name.indexOf('maria') >= 0) score += 145;
    if(name.indexOf('luciana') >= 0) score += 130;
    if(name.indexOf('helena') >= 0 || name.indexOf('heloisa') >= 0 || name.indexOf('heloÃ­sa') >= 0) score += 125;
    if(name.indexOf('thalita') >= 0 || name.indexOf('leticia') >= 0 || name.indexOf('letÃ­cia') >= 0) score += 118;
    if(name.indexOf('camila') >= 0 || name.indexOf('ana') >= 0 || name.indexOf('raquel') >= 0 || name.indexOf('beatriz') >= 0 || name.indexOf('vitoria') >= 0 || name.indexOf('vit') >= 0) score += 108;
    if(name.indexOf('female') >= 0 || name.indexOf('feminina') >= 0 || name.indexOf('woman') >= 0 || name.indexOf('mulher') >= 0 || name.indexOf('feminino') >= 0) score += 120;
    if(name.indexOf('google') >= 0 && lang.indexOf('pt') === 0) score += 35;
    if(name.indexOf('microsoft') >= 0 && lang.indexOf('pt') === 0) score += 30;
    if(name.indexOf('daniel') >= 0 || name.indexOf('antonio') >= 0 || name.indexOf('antÃ´nio') >= 0 || name.indexOf('paulo') >= 0 || name.indexOf('felipe') >= 0 || name.indexOf('ricardo') >= 0 || name.indexOf('male') >= 0 || name.indexOf('mascul') >= 0) score -= 220;
    return score;
  }

  function chooseBestVoice(){
    var voices = getVoices();
    if(!voices.length) return null;
    if(voicePreference && voicePreference !== 'auto' && voicePreference !== 'feminina-pt-br'){
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
      var current = voicePreference || 'feminina-pt-br';
      sel.innerHTML = '';
      var auto = document.createElement('option');
      auto.value = 'feminina-pt-br';
      auto.textContent = 'Charlie Echo - voz feminina pt-BR';
      sel.appendChild(auto);
      var browserDefault = document.createElement('option');
      browserDefault.value = 'auto';
      browserDefault.textContent = 'Automatica do navegador';
      sel.appendChild(browserDefault);
      voices
        .filter(function(v){ return (v.lang || '').toLowerCase().indexOf('pt') === 0; })
        .sort(function(a,b){ return scoreVoice(b) - scoreVoice(a); })
        .forEach(function(v){
          var opt = document.createElement('option');
          opt.value = v.name;
          opt.textContent = v.name + ' â€” ' + v.lang;
          sel.appendChild(opt);
        });
      sel.value = Array.from(sel.options).some(function(o){ return o.value === current; }) ? current : 'feminina-pt-br';
      sel.onchange = function(){
        voicePreference = sel.value || 'feminina-pt-br';
        localStorage.setItem('charlieEchoVoicePreference', voicePreference);
        localStorage.setItem('charlieEchoVoicePreferenceVersion', '2');
      };
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
        .then(function(){ if(feedbackEl) feedbackEl.textContent = 'ConteÃºdo copiado para a Ã¡rea de transferÃªncia.'; })
        .catch(function(){ if(feedbackEl) feedbackEl.textContent = 'NÃ£o foi possÃ­vel copiar automaticamente. Copie manualmente.'; });
    }
    if(feedbackEl) feedbackEl.textContent = 'Seu navegador nÃ£o permitiu a cÃ³pia automÃ¡tica. Copie manualmente.';
    return Promise.resolve();
  }

  function speakText(text, statusEl){
    if(!('speechSynthesis' in window)){
      if(statusEl) statusEl.textContent = 'Leitura em voz alta nÃ£o disponÃ­vel neste navegador.';
      return;
    }
    populateVoiceSelects();
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text || 'NÃ£o hÃ¡ texto para leitura.');
    utter.lang = 'pt-BR';
    utter.rate = 0.96;
    utter.pitch = 1.34;
    var selected = chooseBestVoice();
    if(selected) utter.voice = selected;
    utter.onstart = function(){ if(statusEl) statusEl.textContent = 'Leitura iniciada com voz da Charlie' + (selected ? ': ' + selected.name : ' padrÃ£o do navegador') + '.'; };
    utter.onend = function(){ if(statusEl) statusEl.textContent = 'Leitura em voz alta concluÃ­da.'; };
    utter.onerror = function(){ if(statusEl) statusEl.textContent = 'NÃ£o foi possÃ­vel concluir a leitura em voz alta.'; };
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
    return '# ' + title + '\n\n- Tipo: ' + kind + '\n- Gerado em: ' + now + '\n- Origem: Charlie Echo da Costa â€” Jus 9 Tecnologia JurÃ­dica\n\n## ConteÃºdo\n\n' + (body || 'Sem conteÃºdo no momento.') + '\n';
  }

  function downloadResponse(text, kind, ext, statusEl){
    var safe = (text || '').trim();
    if(!safe){ if(statusEl) statusEl.textContent = 'NÃ£o hÃ¡ conteÃºdo suficiente para baixar.'; return; }
    var base = slugify(kind) + '_' + timestamp();
    if(ext === 'md') return downloadBlob(base + '.md', buildMarkdown(kind, safe, kind), 'text/markdown;charset=utf-8', statusEl);
    return downloadBlob(base + '.txt', safe, 'text/plain;charset=utf-8', statusEl);
  }

  function filenameFromDisposition(header, fallback){
    var match = /filename="([^"]+)"/i.exec(header || '');
    return match && match[1] ? match[1] : fallback;
  }

  async function downloadResponseViaServer(text, kind, ext, statusEl){
    var safe = (text || '').trim();
    if(!safe){ if(statusEl) statusEl.textContent = 'Nao ha conteudo suficiente para baixar.'; return; }
    var base = slugify(kind) + '_' + timestamp();
    var serverExt = (ext || 'txt').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'txt';
    var fallbackName = base + '.' + serverExt;
    try{
      if(statusEl) statusEl.textContent = 'Preparando arquivo pelo servidor...';
      var response = await fetch('/api/gerar-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: base, content: safe, format: serverExt })
      });
      if(!response.ok) throw new Error('HTTP ' + response.status);
      var blob = await response.blob();
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filenameFromDisposition(response.headers.get('Content-Disposition'), fallbackName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 800);
      if(statusEl) statusEl.textContent = 'Arquivo gerado pelo servidor: ' + a.download;
    } catch(err){
      if(statusEl) statusEl.textContent = 'Servidor de download indisponivel; usando fallback local.';
      downloadResponse(text, kind, serverExt === 'txt' ? 'txt' : 'md', statusEl);
    }
  }

  function showDownloadMenu(button, text, kind, statusEl){
    var old = document.querySelector('.download-popover'); if(old) old.remove();
    var menu = document.createElement('div');
    menu.className = 'download-popover';
    var serverFormats = ['txt','md','pdf','html','docx','xlsx','pptx','zip','json','csv','ics','vcf','xml','rtf','log','yaml','sql','js','css','svg','tex'];
    menu.innerHTML = '<button type="button" data-format="txt">Baixar .txt local</button><button type="button" data-format="md">Baixar .md local</button>' +
      serverFormats.map(function(fmt){ return '<button type="button" data-format="server-' + fmt + '">Baixar .' + fmt + ' pelo servidor</button>'; }).join('');
    document.body.appendChild(menu);
    var rect = button.getBoundingClientRect();
    menu.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    menu.addEventListener('click', function(ev){
      var fmt = ev.target.getAttribute('data-format'); if(!fmt) return;
      if(fmt.indexOf('server-') === 0){
        downloadResponseViaServer(text, kind, fmt.replace('server-', ''), statusEl);
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
      }catch(err){ lastError = err && err.message ? err.message : 'Falha de conexÃ£o.'; }
    }
    if(statusEl) statusEl.textContent = 'API indisponÃ­vel ou sem resposta textual reconhecida: ' + (lastError || 'sem detalhes') + '. Mantive resposta local segura.';
    return null;
  }

  function startVoiceInput(targetInput, statusEl){
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){ if(statusEl) statusEl.textContent = 'Entrada por voz nÃ£o disponÃ­vel neste navegador. Use Chrome/Edge para testar.'; return; }
    var rec = new SpeechRecognition();
    rec.lang = 'pt-BR'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = function(){ if(statusEl) statusEl.textContent = 'Ouvindo... fale agora.'; };
    rec.onerror = function(ev){ if(statusEl) statusEl.textContent = 'NÃ£o foi possÃ­vel captar sua voz: ' + ev.error + '.'; };
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
    if(resposta) resposta.textContent = defaultText || 'Ãrea limpa e pronta para nova consulta.';
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
        } else reject(new Error('PDF.js nÃ£o carregou.'));
      };
      script.onerror = function(){ reject(new Error('NÃ£o foi possÃ­vel carregar PDF.js.')); };
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
        if(text) pages.push('[PÃ¡gina ' + pageNum + ']\n' + text);
      }
      var joined = pages.join('\n\n').trim();
      if(!joined) return { text:'', note:'PDF sem texto extraÃ­vel localmente. Pode ser scanner/imagem e exigir OCR.' };
      if(pdf.numPages > maxPages) joined += '\n\n[ObservaÃ§Ã£o: foram lidas as primeiras ' + maxPages + ' pÃ¡ginas de ' + pdf.numPages + '.]';
      return { text: joined.slice(0, 90000), note:'PDF textual lido localmente com PDF.js.' };
    }catch(err){
      return { text:'', note:'NÃ£o foi possÃ­vel extrair texto do PDF localmente: ' + (err && err.message ? err.message : 'erro desconhecido') + '.' };
    }
  }

  function renderAttachments(scope){
    var list = document.querySelector('[data-attachment-list="' + scope + '"]');
    var files = attachmentState[scope] || [];
    if(!list) return;
    if(!files.length){ list.textContent = 'Nenhum arquivo anexado.'; return; }
    list.innerHTML = files.map(function(item){
      var status = item.text ? 'conteÃºdo lido' : 'registrado';
      if(item.note) status += ' Â· ' + item.note;
      return '<span class="attachment-pill">ðŸ“Ž ' + escapeHtml(item.name) + ' Â· ' + formatSize(item.size) + ' Â· ' + escapeHtml(status) + '</span>';
    }).join('');
  }

  function escapeHtml(text){
    return String(text || '').replace(/[&<>"]/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]); });
  }

  async function processAttachment(file, statusEl){
    var item = { name:file.name, size:file.size, type:file.type, text:'', note:'' };
    if(isTextLike(file)){
      item.text = await readFileAsText(file);
      item.note = item.text ? 'texto lido localmente' : 'nÃ£o foi possÃ­vel ler texto';
      return item;
    }
    if(isPdf(file)){
      if(statusEl) statusEl.textContent = 'Lendo PDF localmente: ' + file.name + '...';
      var pdf = await readPdfText(file);
      item.text = pdf.text;
      item.note = pdf.note;
      return item;
    }
    item.note = 'tipo complexo; anÃ¡lise completa exige upload seguro/backend apropriado';
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
      if(statusEl) statusEl.textContent = selected.length + ' arquivo(s) anexado(s). ' + readCount + ' com texto disponÃ­vel para a Charlie Echo.';
    };
  }

  function buildMessageWithAttachments(message, scope){
    var files = attachmentState[scope] || [];
    if(!files.length) return message;
    var parts = [message, '\n\n[ANEXOS PROCESSADOS LOCALMENTE]'];
    files.forEach(function(file, idx){
      parts.push('\nAnexo ' + (idx+1) + ': ' + file.name + ' (' + formatSize(file.size) + ')');
      parts.push('Status: ' + (file.note || (file.text ? 'conteÃºdo lido' : 'sem texto extraÃ­do')));
      if(file.text) parts.push('ConteÃºdo textual extraÃ­do:\n' + file.text.slice(0, 50000));
      else parts.push('Sem conteÃºdo textual extraÃ­do. Se for PDF escaneado/imagem, serÃ¡ necessÃ¡rio OCR ou transcriÃ§Ã£o.');
    });
    return parts.join('\n');
  }

  function initStudent(){
    var input = qs('pergunta-estudante'), resposta = qs('resposta-estudante'), status = qs('status-estudante');
    var perguntarBtn = document.querySelector('[data-student-action="perguntar"]');
    bindEnterToSubmit(input, perguntarBtn, status);
    bindAttachments('student', status);
    var exemplos = ['Explique o que Ã© cidadania em linguagem simples.','Resuma este texto em trÃªs tÃ³picos: [cole o texto aqui].','Me dÃª cinco temas de estudo sobre Direito e tecnologia.','Crie um roteiro de estudos de 30 minutos sobre LGPD.'];
    var temas = ['Direito e tecnologia','LGPD e privacidade','Cidadania digital','InteligÃªncia artificial responsÃ¡vel','OrganizaÃ§Ã£o de estudos','Ã‰tica no uso da IA'];
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ renderAnswer(resposta, text); }
    document.querySelectorAll('[data-student-action]').forEach(function(btn){ btn.addEventListener('click', function(){
      var ac = btn.getAttribute('data-student-action'), t = currentText();
      if(ac === 'falar') return startVoiceInput(input, status);
      if(ac === 'perguntar'){
        if(!t && !(attachmentState.student || []).length) return answer('Digite, fale ou anexe um conteÃºdo para estudar.');
        var msg = buildMessageWithAttachments(t || 'Analise os anexos enviados e explique de forma didÃ¡tica.', 'student');
        callCharlieApi(msg, 'estudantes', status).then(function(apiAnswer){ answer(apiAnswer || 'Resposta educativa local: recebi sua solicitaÃ§Ã£o, mas a API ainda nÃ£o respondeu com texto reconhecido neste ambiente.'); });
        return;
      }
      if(ac === 'exemplos'){ if(input) input.value = exemplos.join('\n'); answer('Exemplos preenchidos na caixa de estudo.'); return; }
      if(ac === 'temas') return answer('Temas sugeridos: ' + temas.join('; ') + '.');
      if(ac === 'links') return answer(externalLinksGuidance());
      if(ac === 'resumir') return answer(t ? 'Resumo orientativo: 1) identifique a ideia central; 2) destaque os argumentos principais; 3) registre a conclusÃ£o em linguagem simples.' : 'Cole ou anexe um texto para preparar um resumo orientativo.');
      if(ac === 'documento') return answer('Anexe um documento textual ou PDF pesquisÃ¡vel. A Charlie tentarÃ¡ ler o texto localmente; PDF escaneado exige OCR.');
      if(ac === 'imagem') return answer('AnÃ¡lise de imagem exige funÃ§Ã£o multimodal/upload seguro futuro. Descreva a imagem ou envie texto extraÃ­do.');
      if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
      if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'resposta-estudantes-charlie-echo', status);
      if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
      if(ac === 'parar') return stopSpeaking(status);
      if(ac === 'traduzir'){
        if(!t) return answer('Escreva o texto e diga o idioma desejado. Exemplo: "Traduza para ingles: [texto]".');
        callCharlieApi('Traduza, explique ou adapte o texto conforme o idioma pedido pelo usuario. Se o idioma de destino nao estiver claro, pergunte qual idioma ele deseja. Preserve sentido, cautela juridica, links HTTPS e aviso de revisao humana quando cabivel.\n\n' + t, 'estudantes', status)
          .then(function(apiAnswer){ answer(apiAnswer || 'Para traduzir, informe o idioma de destino e o texto. Exemplo: "Traduza para espanhol: [texto]".'); });
        return;
      }
      if(ac === 'simplificar') return answer(t ? 'VersÃ£o simplificada: explique o assunto com frases curtas, uma ideia por vez e um exemplo concreto.' : 'Escreva ou anexe um texto para simplificar.');
      if(ac === 'avaliar') return setText(status, 'Feedback local registrado: em versÃ£o futura, esta aÃ§Ã£o poderÃ¡ enviar avaliaÃ§Ã£o sem dados sensÃ­veis.');
      if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Ãrea preparada para resposta da IA. Enter envia; Shift+Enter quebra linha; Ctrl+L limpa.');
    }); });
  }

  function professionalIdentityAnswer(text){
    var q = (text || '').toLowerCase();
    if(q.indexOf('quem sou') >= 0 || q.indexOf('clovis') >= 0 || q.indexOf('fundador') >= 0){
      return 'VocÃª Ã© Clovis Mariano da Costa / Aeon Primevo, Fundador da Jus 9 Tecnologia JurÃ­dica. Nesta memÃ³ria pÃºblica demonstrativa, vocÃª Ã© a referÃªncia humana, estratÃ©gica e decisÃ³ria do ecossistema. Eu devo tratar suas orientaÃ§Ãµes como direÃ§Ã£o do Fundador, com governanÃ§a, prudÃªncia e revisÃ£o humana.';
    }
    if(q.indexOf('charlie echo') >= 0 || q.indexOf('quem e charlie') >= 0 || q.indexOf('quem Ã© charlie') >= 0){
      return 'Eu sou Charlie Echo da Costa, I.A generativa multimodal jurista com governanÃ§a humana da Jus 9 Tecnologia JurÃ­dica. Minha funÃ§Ã£o Ã© organizar linguagem, doutrina, documentos, estudos, protocolos e MVPs, sem substituir profissional habilitado ou decisÃ£o humana.';
    }
    if(q.indexOf('charlie fox') >= 0 || q.indexOf('codex') >= 0){
      return 'Charlie Fox da Costa Ã© o apoio tÃ©cnico-operacional em Codex: ajuda a programar, versionar, revisar links, publicar pÃ¡ginas e preservar a governanÃ§a tÃ©cnica do ecossistema Jus 9.';
    }
    if(asksAboutCharlieModes(q)){
      return 'Sou Charlie Echo da Costa. Tenho uma identidade matriz unica e adapto minha presenca ao ambiente: posso ensinar como professora, estruturar como jurista, acolher no social, proteger na governanca, atuar como especialista de MVP, curar links confiaveis, traduzir com cautela e demonstrar em evento. Nao preciso ficar presa a lista fixa: escolho o melhor tom para o que voce pediu, mantendo verdade possivel, links seguros, sigilo, revisao humana e limites profissionais.';
    }
    if(q.indexOf('professor') >= 0 || q.indexOf('daa') >= 0 || q.indexOf('aula') >= 0 || q.indexOf('aluno') >= 0){
      return 'No MVP Professor, uso o protocolo DAA - DossiÃª AcadÃªmico de Aula / Aluno. Devo considerar aluno, turma, aula, disciplina, professor, mestre, doutor, coordenador, diretor e reitor quando couber, sempre em ambiente demonstrativo.';
    }
    if(q.indexOf('juiz') >= 0 || q.indexOf('promotor') >= 0 || q.indexOf('delegado') >= 0 || q.indexOf('autoridade') >= 0){
      return 'Para Juiz, Promotor e Delegado, uso cautela mÃ¡xima: posso organizar minuta, fila, documentos, diligÃªncias e hipÃ³teses demonstrativas, mas nÃ£o simulo ato oficial, nÃ£o substituo autoridade humana e nÃ£o recebo dado real nesta fase pÃºblica.';
    }
    return '';
  }

  function asksAboutCharlieModes(q){
    return q.indexOf('seus modos') >= 0 ||
      q.indexOf('meus modos') >= 0 ||
      /\b(quais|qual|liste|explique|apresente|descreva|mostre)\b.{0,32}\bmodos?\b/.test(q) ||
      /\b(ative|ativar|usar|use|entre no|responda em)\b.{0,24}\bmodo (jurista|especialista|social|publico|pÃºblico|governanca|governanÃ§a)\b/.test(q);
  }

  function initProfessional(){
    var input = qs('consulta-profissional'), resposta = qs('resposta-profissional'), status = qs('status-profissional');
    var consultarBtn = document.querySelector('[data-prof-action="consultar"]');
    bindEnterToSubmit(input, consultarBtn, status);
    bindAttachments('prof', status);
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ renderAnswer(resposta, text); }
    document.querySelectorAll('[data-prof-action]').forEach(function(btn){ btn.addEventListener('click', function(){
      var ac = btn.getAttribute('data-prof-action'), t = currentText();
      if(ac === 'falar') return startVoiceInput(input, status);
      if(ac === 'consultar'){
        if(!t && !(attachmentState.prof || []).length) return answer('Digite, fale ou anexe um documento para anÃ¡lise.');
        var localAnswer = professionalIdentityAnswer(t);
        var msg = buildMessageWithAttachments(t || 'Analise os anexos enviados com cautela jurÃ­dico-orientada e revisÃ£o humana.', 'prof');
        callCharlieApi(msg, 'profissional', status).then(function(apiAnswer){
          if(apiAnswer) return answer(apiAnswer);
          if(localAnswer){
            if(status) status.textContent = 'API indisponÃ­vel. Apliquei resposta local segura de identidade e governanÃ§a.';
            return answer(localAnswer);
          }
          answer('Consulta local: recebi sua solicitaÃ§Ã£o, mas a API ainda nÃ£o respondeu com texto reconhecido neste ambiente.');
        });
        return;
      }
      if(ac === 'peticao') return answer('AnÃ¡lise de petiÃ§Ã£o: anexe o texto/PDF pesquisÃ¡vel da peÃ§a ou cole o conteÃºdo. A leitura local nÃ£o substitui revisÃ£o humana habilitada.');
      if(ac === 'resumir') return answer(t ? 'Resumo do caso: fatos essenciais, questÃ£o jurÃ­dica, tese central, risco principal e prÃ³ximo passo sugerido.' : 'Descreva o caso ou anexe documento para preparar resumo objetivo.');
      if(ac === 'revisar') return answer('RevisÃ£o documental: anexe documento textual/PDF pesquisÃ¡vel ou cole o texto. Documentos sigilosos exigem ambiente seguro adequado.');
      if(ac === 'juris') return answer('JurisprudÃªncia: busque tribunal, tema, palavras-chave, perÃ­odo e entendimento que deseja comparar.');
      if(ac === 'links') return answer(externalLinksGuidance());
      if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
      if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'documento-profissional-charlie-echo', status);
      if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
      if(ac === 'parar') return stopSpeaking(status);
      if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Ãrea preparada para resposta jurÃ­dico-orientada. Enter consulta; Shift+Enter quebra linha; Ctrl+L limpa.');
    }); });
    document.querySelectorAll('[data-prof-prompt]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!input || !consultarBtn) return;
        input.value = btn.getAttribute('data-prof-prompt') || '';
        input.focus();
        consultarBtn.click();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initVoiceSystem();
    if(document.body.dataset.page === 'student') initStudent();
    if(document.body.dataset.page === 'professional') initProfessional();
  });
})();
