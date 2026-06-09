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
  var roomState = { student: null, prof: null };
  var pdfJsPromise = null;
  var tesseractPromise = null;
  var jsZipPromise = null;
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
    if(name.indexOf('helena') >= 0 || name.indexOf('heloisa') >= 0) score += 125;
    if(name.indexOf('thalita') >= 0 || name.indexOf('leticia') >= 0) score += 118;
    if(name.indexOf('camila') >= 0 || name.indexOf('ana') >= 0 || name.indexOf('raquel') >= 0 || name.indexOf('beatriz') >= 0 || name.indexOf('vitoria') >= 0 || name.indexOf('vit') >= 0) score += 108;
    if(name.indexOf('female') >= 0 || name.indexOf('feminina') >= 0 || name.indexOf('woman') >= 0 || name.indexOf('mulher') >= 0 || name.indexOf('feminino') >= 0) score += 120;
    if(name.indexOf('google') >= 0 && lang.indexOf('pt') === 0) score += 35;
    if(name.indexOf('microsoft') >= 0 && lang.indexOf('pt') === 0) score += 30;
    if(name.indexOf('daniel') >= 0 || name.indexOf('antonio') >= 0 || name.indexOf('paulo') >= 0 || name.indexOf('felipe') >= 0 || name.indexOf('ricardo') >= 0 || name.indexOf('male') >= 0 || name.indexOf('mascul') >= 0) score -= 220;
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
        .then(function(){ if(feedbackEl) feedbackEl.textContent = 'Conteudo copiado para a area de transferencia.'; })
        .catch(function(){ if(feedbackEl) feedbackEl.textContent = 'Nao foi possivel copiar automaticamente. Copie manualmente.'; });
    }
    if(feedbackEl) feedbackEl.textContent = 'Seu navegador nao permitiu a copia automatica. Copie manualmente.';
    return Promise.resolve();
  }

  function speakText(text, statusEl){
    if(!('speechSynthesis' in window)){
      if(statusEl) statusEl.textContent = 'Leitura em voz alta nao disponivel neste navegador.';
      return;
    }
    populateVoiceSelects();
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text || 'Nao ha texto para leitura.');
    utter.lang = 'pt-BR';
    utter.rate = 0.96;
    utter.pitch = 1.34;
    var selected = chooseBestVoice();
    if(selected) utter.voice = selected;
    utter.onstart = function(){ if(statusEl) statusEl.textContent = 'Leitura iniciada com voz da Charlie' + (selected ? ': ' + selected.name : ' padrao do navegador') + '.'; };
    utter.onend = function(){ if(statusEl) statusEl.textContent = 'Leitura em voz alta concluida.'; };
    utter.onerror = function(){ if(statusEl) statusEl.textContent = 'Nao foi possivel concluir a leitura em voz alta.'; };
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

  function roomStorageKey(scope){ return 'charlieEchoRooms_' + scope + '_v1'; }

  function createRoom(scope, title){
    var now = new Date().toISOString();
    return {
      id: scope + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      title: title || (scope === 'prof' ? 'Sala profissional' : 'Sala de estudo'),
      createdAt: now,
      updatedAt: now,
      status: 'active',
      summary: '',
      lastUserIntent: '',
      currentTopic: '',
      openTasks: [],
      messages: [],
      attachments: []
    };
  }

  function loadRooms(scope){
    try{
      var raw = sessionStorage.getItem(roomStorageKey(scope));
      var parsed = raw ? JSON.parse(raw) : null;
      if(parsed && parsed.activeId && Array.isArray(parsed.rooms) && parsed.rooms.length) {
        parsed.rooms.forEach(function(room){ if(!room.status) room.status = 'active'; });
        return parsed;
      }
    }catch(err){}
    var first = createRoom(scope, scope === 'prof' ? 'Atendimento profissional' : 'Estudo inicial');
    return { activeId:first.id, rooms:[first] };
  }

  function saveRooms(scope, data){
    try{ sessionStorage.setItem(roomStorageKey(scope), JSON.stringify(data)); }catch(err){}
  }

  function getRoomData(scope){
    if(!roomState[scope]) roomState[scope] = loadRooms(scope);
    return roomState[scope];
  }

  function getActiveRoom(scope){
    var data = getRoomData(scope);
    var room = data.rooms.find(function(item){ return item.id === data.activeId; });
    if(!room || room.status === 'deleted'){
      room = data.rooms.find(function(item){ return item.status !== 'deleted' && item.status !== 'archived'; }) ||
        data.rooms.find(function(item){ return item.status !== 'deleted'; }) ||
        createRoom(scope);
      if(data.rooms.indexOf(room) < 0) data.rooms.unshift(room);
      data.activeId = room.id;
      saveRooms(scope, data);
    }
    return room;
  }

  function guessRoomTitle(text, fallback){
    var cleaned = (text || '').replace(/\s+/g, ' ').trim();
    if(!cleaned) return fallback || 'Nova conversa';
    return cleaned.slice(0, 48) + (cleaned.length > 48 ? '...' : '');
  }

  function summarizeForMemory(room, userText, answerText){
    var topic = guessRoomTitle(userText || room.currentTopic || room.title, room.title);
    room.currentTopic = topic;
    room.lastUserIntent = (userText || '').slice(0, 220);
    var recent = (room.messages || []).slice(-10).map(function(msg){
      return (msg.role === 'user' ? 'Usuario: ' : 'Charlie: ') + String(msg.content || '').replace(/\s+/g, ' ').slice(0, 180);
    }).join(' | ');
    var base = 'Assunto ativo: ' + topic + '.';
    if(userText) base += ' Ultima pergunta: ' + userText.slice(0, 220) + '.';
    if(answerText) base += ' Ultima resposta: ' + answerText.slice(0, 220) + '.';
    if(recent) base += ' Historico recente: ' + recent + '.';
    if((attachmentState[room.scope || ''] || []).length) base += ' Ha anexos ativos nesta sala.';
    room.summary = base.slice(0, 1800);
    room.updatedAt = new Date().toISOString();
  }

  function renderRooms(scope){
    var list = document.querySelector('[data-room-list="' + scope + '"]');
    if(!list) return;
    var data = getRoomData(scope);
    var visibleRooms = data.rooms.filter(function(room){ return room.status !== 'deleted'; });
    list.innerHTML = visibleRooms.map(function(room){
      var label = room.status === 'archived' ? room.title + ' (arquivada)' : room.title;
      return '<button class="chat-room-pill' + (room.id === data.activeId ? ' active' : '') + (room.status === 'archived' ? ' archived' : '') + '" type="button" data-room-id="' + room.id + '">' + escapeHtml(label) + '</button>';
    }).join('');
    list.querySelectorAll('[data-room-id]').forEach(function(btn){
      btn.addEventListener('click', function(){
        data.activeId = btn.getAttribute('data-room-id');
        saveRooms(scope, data);
        renderRooms(scope);
        restoreActiveRoom(scope);
      });
    });
  }

  function restoreActiveRoom(scope){
    var room = getActiveRoom(scope);
    var input = scope === 'prof' ? qs('consulta-profissional') : qs('pergunta-estudante');
    var resposta = scope === 'prof' ? qs('resposta-profissional') : qs('resposta-estudante');
    var status = scope === 'prof' ? qs('status-profissional') : qs('status-estudante');
    attachmentState[scope] = room.attachments || [];
    renderAttachments(scope);
    if(room.messages && room.messages.length){
      var lastAssistant = room.messages.slice().reverse().find(function(msg){ return msg.role === 'assistant'; });
      if(lastAssistant) renderAnswer(resposta, lastAssistant.content);
    }
    if(input) input.value = '';
    if(status) status.textContent = 'Sala ativa: ' + room.title + '. A Charlie usara a memoria curta desta conversa.';
    renderRoomMemory(scope);
  }

  function renderRoomMemory(scope){
    var panel = document.querySelector('[data-room-panel="' + scope + '"]');
    if(!panel) return;
    var old = panel.querySelector('.chat-room-memory');
    if(old) old.remove();
    var room = getActiveRoom(scope);
    if(!room.summary && !(room.attachments || []).length) return;
    var div = document.createElement('div');
    div.className = 'chat-room-memory';
    div.textContent = room.summary || ('Anexos ativos nesta sala: ' + (room.attachments || []).map(function(f){ return f.name; }).join(', '));
    panel.appendChild(div);
  }

  function initRooms(scope){
    getRoomData(scope);
    renderRooms(scope);
    restoreActiveRoom(scope);
    var newBtn = document.querySelector('[data-room-new="' + scope + '"]');
    var renameBtn = document.querySelector('[data-room-rename="' + scope + '"]');
    var archiveBtn = document.querySelector('[data-room-archive="' + scope + '"]');
    var deleteBtn = document.querySelector('[data-room-delete="' + scope + '"]');
    var clearBtn = document.querySelector('[data-room-clear="' + scope + '"]');
    if(newBtn) newBtn.addEventListener('click', function(){
      var data = getRoomData(scope);
      var index = data.rooms.length + 1;
      var room = createRoom(scope, scope === 'prof' ? 'Sala profissional ' + index : 'Sala de estudo ' + index);
      data.rooms.unshift(room);
      data.activeId = room.id;
      saveRooms(scope, data);
      renderRooms(scope);
      restoreActiveRoom(scope);
      renderRoomMemory(scope);
    });
    if(renameBtn) renameBtn.addEventListener('click', function(){
      var room = getActiveRoom(scope);
      var title = window.prompt('Novo nome da sala:', room.title);
      if(!title) return;
      room.title = title.slice(0, 80);
      room.updatedAt = new Date().toISOString();
      saveRooms(scope, getRoomData(scope));
      renderRooms(scope);
      restoreActiveRoom(scope);
    });
    if(archiveBtn) archiveBtn.addEventListener('click', function(){
      var data = getRoomData(scope);
      var room = getActiveRoom(scope);
      room.status = room.status === 'archived' ? 'active' : 'archived';
      room.updatedAt = new Date().toISOString();
      if(room.status === 'archived'){
        var next = data.rooms.find(function(item){ return item.id !== room.id && item.status !== 'deleted' && item.status !== 'archived'; });
        if(next) data.activeId = next.id;
      } else {
        data.activeId = room.id;
      }
      saveRooms(scope, data);
      renderRooms(scope);
      restoreActiveRoom(scope);
    });
    if(deleteBtn) deleteBtn.addEventListener('click', function(){
      var data = getRoomData(scope);
      var room = getActiveRoom(scope);
      if(!window.confirm('Excluir esta sala localmente? Esta acao remove a conversa desta sessao.')) return;
      room.status = 'deleted';
      room.updatedAt = new Date().toISOString();
      var next = data.rooms.find(function(item){ return item.status !== 'deleted' && item.status !== 'archived'; }) ||
        data.rooms.find(function(item){ return item.status !== 'deleted'; });
      if(!next){
        next = createRoom(scope, scope === 'prof' ? 'Atendimento profissional' : 'Estudo inicial');
        data.rooms.unshift(next);
      }
      data.activeId = next.id;
      saveRooms(scope, data);
      renderRooms(scope);
      restoreActiveRoom(scope);
    });
    if(clearBtn) clearBtn.addEventListener('click', function(){
      var room = getActiveRoom(scope);
      room.summary = '';
      room.lastUserIntent = '';
      room.currentTopic = '';
      room.openTasks = [];
      room.messages = [];
      room.attachments = [];
      attachmentState[scope] = [];
      saveRooms(scope, getRoomData(scope));
      restoreActiveRoom(scope);
    });
  }

  function buildMessageWithRoomMemory(message, scope){
    var room = getActiveRoom(scope);
    var parts = [];
    if(room.summary){
      parts.push('[MEMORIA CURTA DA SALA]');
      parts.push(room.summary);
      parts.push('Se a pergunta atual for continuacao, use este contexto. Se ficar ambiguo, pergunte confirmacao curta.');
    }
    var recent = (room.messages || []).slice(-16);
    if(recent.length){
      parts.push('[HISTORICO RECENTE DA SALA]');
      parts.push(recent.map(function(msg){
        return (msg.role === 'user' ? 'Usuario: ' : 'Charlie: ') + String(msg.content || '').slice(0, 700);
      }).join('\n'));
    }
    parts.push(message);
    return parts.join('\n\n');
  }

  function rememberExchange(scope, userText, answerText){
    var room = getActiveRoom(scope);
    room.scope = scope;
    room.messages = room.messages || [];
    if(userText) room.messages.push({ role:'user', content:userText, createdAt:new Date().toISOString() });
    if(answerText) room.messages.push({ role:'assistant', content:answerText, createdAt:new Date().toISOString() });
    room.messages = room.messages.slice(-24);
    room.attachments = attachmentState[scope] || [];
    summarizeForMemory(room, userText, answerText);
    saveRooms(scope, getRoomData(scope));
    renderRooms(scope);
    renderRoomMemory(scope);
  }

  function continuationFallback(scope, userText, defaultText){
    var room = getActiveRoom(scope);
    var q = (userText || '').toLowerCase();
    var intent = intentFallback(scope, userText);
    if(intent){
      return room.summary
        ? intent + '\n\nContinuando pela memoria curta desta sala: ' + room.summary
        : intent;
    }
    var looksContinuation = /\b(agora|continue|continuar|sobre isso|sobre o anterior|liste|riscos|checklist|resuma|explique melhor|proximo|próximo)\b/.test(q);
    if(looksContinuation && room.summary){
      return 'Vou continuar pela memoria curta da sala ativa.\n\n' +
        room.summary + '\n\n' +
        'Com base nisso, sua nova pergunta foi: ' + (userText || '(sem texto novo)') + '\n\n' +
        'Resposta local provisoria: consigo manter o assunto anterior nesta sala. Para uma analise completa, a API segura deve responder usando este mesmo contexto.';
    }
    return defaultText;
  }

  function intentFallback(scope, userText){
    var q = (userText || '').toLowerCase();
    if(!q) return '';
    if(/\b(jurisprudencia|jurisprudência|precedente|acordao|acórdão|entendimento dos tribunais)\b/.test(q) && /\b(explique|fale sobre|conceito|analise|resuma|sintetize|como funciona|o que e|o que é)\b/.test(q)){
      return 'Analise jurisprudencial orientativa: jurisprudencia e o conjunto de entendimentos formados pelos tribunais ao julgar casos concretos. Ela ajuda a perceber como uma norma vem sendo aplicada, quais argumentos costumam ser aceitos, quais fatos mudam o resultado e quais riscos existem em uma tese.\n\nPara usar bem, separe: tema juridico, tribunal relevante, periodo, tipo de acao, fatos decisivos, tese acolhida ou rejeitada e inteiro teor. Uma ementa isolada nao basta para uso profissional seguro.\n\nSem fonte conferida, eu posso explicar tendencias e criterios, mas nao devo inventar processo, relator, data, tribunal ou tese vinculante. Se voce precisar citar em peca, parecer ou aula, o proximo passo e conferir em base oficial do tribunal e revisar com humano qualificado.';
    }
    if(/\b(doutrina|doutrinario|doutrinaria|teoria juridica|conceito juridico)\b/.test(q) && /\b(explique|fale sobre|conceito|analise|resuma|sintetize|como funciona|sem citar autores)\b/.test(q)){
      return 'Sintese doutrinaria orientativa: doutrina e a elaboracao tecnica de conceitos, fundamentos, correntes e argumentos sobre o Direito. Ela ajuda a organizar interpretacao, criticar solucoes, comparar posicoes e construir raciocinio juridico.\n\nSem fonte conferida, posso explicar conceitos e correntes possiveis, mas nao devo inventar autor, obra, pagina ou citacao literal. Para uso profissional, o ideal e converter a sintese em ficha com fonte, edicao, ano, argumento central e revisao humana.';
    }
    if(q.indexOf('responsabilidade social') >= 0 && (q.indexOf('empresa') >= 0 || q.indexOf('empresarial') >= 0)){
      return 'Responsabilidade social empresarial e o compromisso de uma empresa com os efeitos que ela causa nas pessoas, na comunidade, nos trabalhadores, nos consumidores, nos fornecedores e no meio ambiente.\n\nNa pratica, isso aparece em acoes como trabalho digno, diversidade, acessibilidade, protecao de dados, compras eticas, reducao de impacto ambiental, transparencia, apoio comunitario e prestacao de contas. O ponto principal e que responsabilidade social nao pode ser so propaganda: precisa ter meta, pratica verificavel e coerencia com a atividade da empresa.\n\nUm bom proximo passo e montar uma matriz simples: impacto causado, publico afetado, risco, acao concreta, indicador e responsavel humano pela revisao.';
    }
    if(/\b(resuma|resumo|sintetize|sintese)\b/.test(q)){
      return 'Resumo local: posso condensar o tema em ideia central, pontos essenciais, riscos e proximo passo. Cole o texto ou indique qual parte da conversa devo resumir.';
    }
    if(/\b(compare|comparar|diferen[cç]a|versus| vs )\b/.test(q)){
      return 'Comparacao local: vou separar conceito, finalidade, quando usar, riscos e exemplo pratico. Se envolver Direito, a comparacao precisa de fonte oficial ou revisao humana.';
    }
    if(/\b(minuta|modelo|documento|peti[cç][aã]o|contrato|oficio|ofício)\b/.test(q)){
      return 'Posso estruturar uma minuta demonstrativa com titulo, partes, objetivo, campos a preencher, clausulas ou topicos e aviso de revisao humana. Nao use dados reais neste ambiente publico.';
    }
    if(/\b(link|site|url|onde acessar|onde encontro|download|baixar)\b/.test(q)){
      return externalLinksGuidance();
    }
    if(scope === 'student' && /\b(explique|aula|ensine|exemplo|exercicio|exercício)\b/.test(q)){
      return 'Resposta educativa local: vou explicar por conceito, exemplo pratico, risco, exercicio guiado e proximo passo. Para aprofundar com fontes e contexto maior, a API segura deve responder usando esta mesma sala.';
    }
    return '';
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
    return '# ' + title + '\n\n- Tipo: ' + kind + '\n- Gerado em: ' + now + '\n- Origem: Charlie Echo da Costa - Jus 9 Tecnologia Juridica\n\n## Conteudo\n\n' + (body || 'Sem conteudo no momento.') + '\n';
  }

  function downloadResponse(text, kind, ext, statusEl){
    var safe = (text || '').trim();
    if(!safe){ if(statusEl) statusEl.textContent = 'Nao ha conteudo suficiente para baixar.'; return; }
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
    var serverFormats = [
      { ext: 'pdf', label: 'Baixar PDF' },
      { ext: 'docx', label: 'Baixar DOCX' },
      { ext: 'pptx', label: 'Baixar PPTX' },
      { ext: 'zip', label: 'Baixar ZIP' }
    ];
    menu.innerHTML = serverFormats.map(function(format){
      return '<button type="button" data-format="server-' + format.ext + '">' + format.label + '</button>';
    }).join('');
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

  async function callCharlieApi(message, mode, statusEl, roomContext){
    var endpoints = ['/api/ia', '/work/api/ia', '/api/work/ia'];
    var lastError = null;
    for(var i=0;i<endpoints.length;i++){
      var endpoint = endpoints[i];
      try{
        if(statusEl) statusEl.textContent = 'Conectando Charlie Echo em ' + endpoint + '...';
        var res = await fetch(endpoint, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            message: message,
            mode: mode,
            room: roomContext ? {
              title: roomContext.title || '',
              summary: roomContext.summary || '',
              currentTopic: roomContext.currentTopic || '',
              lastUserIntent: roomContext.lastUserIntent || '',
              messages: (roomContext.messages || []).slice(-16)
            } : null
          })
        });
        var raw = await res.text();
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch(e) { data = { answer: raw }; }
        var answer = extractAnswer(data);
        if(res.ok && answer){ if(statusEl) statusEl.textContent = 'Resposta recebida da Charlie Echo.'; return answer; }
        lastError = (data && (data.error || data.message || data.detail)) || raw || ('Endpoint respondeu com status ' + res.status);
        if(res.status !== 404) break;
      }catch(err){ lastError = err && err.message ? err.message : 'Falha de conexao.'; }
    }
    if(statusEl) statusEl.textContent = 'API indisponivel ou sem resposta textual reconhecida: ' + (lastError || 'sem detalhes') + '. Mantive resposta local segura.';
    return null;
  }

  function startVoiceInput(targetInput, statusEl){
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){ if(statusEl) statusEl.textContent = 'Entrada por voz nao disponivel neste navegador. Use Chrome/Edge para testar.'; return; }
    var rec = new SpeechRecognition();
    rec.lang = 'pt-BR'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = function(){ if(statusEl) statusEl.textContent = 'Ouvindo... fale agora.'; };
    rec.onerror = function(ev){ if(statusEl) statusEl.textContent = 'Nao foi possivel captar sua voz: ' + ev.error + '.'; };
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
    if(resposta) resposta.textContent = defaultText || 'Area limpa e pronta para nova consulta.';
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
        } else reject(new Error('PDF.js nao carregou.'));
      };
      script.onerror = function(){ reject(new Error('Nao foi possivel carregar PDF.js.')); };
      document.head.appendChild(script);
    });
    return pdfJsPromise;
  }

  function ensureTesseract(){
    if(window.Tesseract) return Promise.resolve(window.Tesseract);
    if(tesseractPromise) return tesseractPromise;
    tesseractPromise = new Promise(function(resolve, reject){
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = function(){ window.Tesseract ? resolve(window.Tesseract) : reject(new Error('Tesseract nao carregou.')); };
      script.onerror = function(){ reject(new Error('Nao foi possivel carregar o OCR local.')); };
      document.head.appendChild(script);
    });
    return tesseractPromise;
  }

  function ensureJsZip(){
    if(window.JSZip) return Promise.resolve(window.JSZip);
    if(jsZipPromise) return jsZipPromise;
    jsZipPromise = new Promise(function(resolve, reject){
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      script.onload = function(){ window.JSZip ? resolve(window.JSZip) : reject(new Error('JSZip nao carregou.')); };
      script.onerror = function(){ reject(new Error('Nao foi possivel carregar leitor de DOCX/XLSX.')); };
      document.head.appendChild(script);
    });
    return jsZipPromise;
  }

  function isImage(file){
    var name = (file.name || '').toLowerCase();
    var type = (file.type || '').toLowerCase();
    return type.indexOf('image/') === 0 || /\.(png|jpe?g|webp)$/i.test(name);
  }

  function isDocx(file){
    return /\.docx$/i.test(file.name || '') || (file.type || '').indexOf('wordprocessingml.document') >= 0;
  }

  function isXlsx(file){
    return /\.xlsx$/i.test(file.name || '') || (file.type || '').indexOf('spreadsheetml.sheet') >= 0;
  }

  function stripXmlText(xml){
    return String(xml || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function readOfficeText(file){
    try{
      var JSZip = await ensureJsZip();
      var data = await readFileAsArrayBuffer(file);
      var zip = await JSZip.loadAsync(data);
      var texts = [];
      if(isDocx(file)){
        var doc = zip.file('word/document.xml');
        if(doc) texts.push(stripXmlText(await doc.async('string')));
      }
      if(isXlsx(file)){
        var shared = zip.file('xl/sharedStrings.xml');
        if(shared) texts.push(stripXmlText(await shared.async('string')));
        var sheetNames = Object.keys(zip.files).filter(function(name){ return /^xl\/worksheets\/sheet\d+\.xml$/.test(name); }).slice(0, 6);
        for(var i=0;i<sheetNames.length;i++) texts.push(stripXmlText(await zip.file(sheetNames[i]).async('string')));
      }
      var joined = texts.join('\n\n').trim();
      return { text: joined.slice(0, 70000), note: joined ? 'conteudo extraido localmente de documento Office' : 'documento Office sem texto extraivel localmente' };
    }catch(err){
      return { text:'', note:'nao foi possivel ler DOCX/XLSX localmente: ' + (err && err.message ? err.message : 'erro desconhecido') };
    }
  }

  async function readImageOcr(file, statusEl){
    try{
      if(statusEl) statusEl.textContent = 'Carregando OCR local para imagem: ' + file.name + '...';
      var Tesseract = await ensureTesseract();
      var result = await Tesseract.recognize(file, 'por+eng', {
        logger:function(progress){
          if(statusEl && progress && progress.status){
            var pct = progress.progress ? ' ' + Math.round(progress.progress * 100) + '%' : '';
            statusEl.textContent = 'OCR local: ' + progress.status + pct;
          }
        }
      });
      var text = result && result.data && result.data.text ? result.data.text.trim() : '';
      return { text:text.slice(0, 70000), note:text ? 'OCR local aplicado na imagem' : 'OCR local nao encontrou texto legivel na imagem' };
    }catch(err){
      return { text:'', note:'OCR local indisponivel ou falhou: ' + (err && err.message ? err.message : 'erro desconhecido') };
    }
  }

  async function ocrPdfFirstPages(file, maxPages, statusEl){
    try{
      var pdfjs = await ensurePdfJs();
      var Tesseract = await ensureTesseract();
      var data = await readFileAsArrayBuffer(file);
      var pdf = await pdfjs.getDocument({ data:data }).promise;
      var pages = [];
      var limit = Math.min(pdf.numPages, maxPages || 2);
      for(var pageNum=1; pageNum<=limit; pageNum++){
        if(statusEl) statusEl.textContent = 'OCR de PDF escaneado: pagina ' + pageNum + ' de ' + limit + '...';
        var page = await pdf.getPage(pageNum);
        var viewport = page.getViewport({ scale:1.45 });
        var canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext:canvas.getContext('2d'), viewport:viewport }).promise;
        var dataUrl = canvas.toDataURL('image/png');
        var result = await Tesseract.recognize(dataUrl, 'por+eng');
        var text = result && result.data && result.data.text ? result.data.text.trim() : '';
        if(text) pages.push('[OCR pagina ' + pageNum + ']\n' + text);
      }
      var joined = pages.join('\n\n').trim();
      return { text: joined.slice(0, 70000), note: joined ? 'OCR local aplicado nas primeiras paginas do PDF' : 'OCR local nao encontrou texto legivel nas primeiras paginas' };
    }catch(err){
      return { text:'', note:'PDF sem texto extraivel; OCR local nao conseguiu processar: ' + (err && err.message ? err.message : 'erro desconhecido') };
    }
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
        if(text) pages.push('[Pagina ' + pageNum + ']\n' + text);
      }
      var joined = pages.join('\n\n').trim();
      if(!joined) return await ocrPdfFirstPages(file, 2, null);
      if(pdf.numPages > maxPages) joined += '\n\n[Observacao: foram lidas as primeiras ' + maxPages + ' paginas de ' + pdf.numPages + '.]';
      return { text: joined.slice(0, 90000), note:'PDF textual lido localmente com PDF.js.' };
    }catch(err){
      return { text:'', note:'Nao foi possivel extrair texto do PDF localmente: ' + (err && err.message ? err.message : 'erro desconhecido') + '.' };
    }
  }

  function renderAttachments(scope){
    var list = document.querySelector('[data-attachment-list="' + scope + '"]');
    var files = attachmentState[scope] || [];
    if(!list) return;
    if(!files.length){ list.textContent = 'Nenhum arquivo anexado.'; return; }
    list.innerHTML = files.map(function(item){
      var status = item.text ? 'conteudo lido' : 'registrado';
      if(item.note) status += ' | ' + item.note;
      return '<span class="attachment-pill">' + escapeHtml(item.name) + ' | ' + formatSize(item.size) + ' | ' + escapeHtml(status) + '</span>';
    }).join('');
  }

  function escapeHtml(text){
    return String(text || '').replace(/[&<>"]/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]); });
  }

  async function processAttachment(file, statusEl){
    var item = { name:file.name, size:file.size, type:file.type, text:'', note:'' };
    if(isTextLike(file)){
      item.text = await readFileAsText(file);
      item.note = item.text ? 'texto lido localmente' : 'nao foi possivel ler texto';
      return item;
    }
    if(isPdf(file)){
      if(statusEl) statusEl.textContent = 'Lendo PDF localmente: ' + file.name + '...';
      var pdf = await readPdfText(file);
      item.text = pdf.text;
      item.note = pdf.note;
      return item;
    }
    if(isImage(file)){
      var ocr = await readImageOcr(file, statusEl);
      item.text = ocr.text;
      item.note = ocr.note;
      return item;
    }
    if(isDocx(file) || isXlsx(file)){
      var office = await readOfficeText(file);
      item.text = office.text;
      item.note = office.note;
      return item;
    }
    item.note = 'tipo complexo; analise completa exige upload seguro/backend apropriado';
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
      var room = getActiveRoom(scope);
      room.attachments = attachmentState[scope];
      room.summary = (room.summary ? room.summary + ' ' : '') + 'Anexos ativos: ' + attachmentState[scope].map(function(f){ return f.name + ' (' + (f.note || 'registrado') + ')'; }).join('; ') + '.';
      saveRooms(scope, getRoomData(scope));
      renderRoomMemory(scope);
      if(statusEl) statusEl.textContent = selected.length + ' arquivo(s) anexado(s). ' + readCount + ' com texto disponivel para a Charlie Echo.';
    };
  }

  function buildMessageWithAttachments(message, scope){
    var files = attachmentState[scope] || [];
    if(!files.length) return buildMessageWithRoomMemory(message, scope);
    var parts = [message, '\n\n[ANEXOS PROCESSADOS LOCALMENTE]'];
    files.forEach(function(file, idx){
      parts.push('\nAnexo ' + (idx+1) + ': ' + file.name + ' (' + formatSize(file.size) + ')');
      parts.push('Status: ' + (file.note || (file.text ? 'conteudo lido' : 'sem texto extraido')));
      if(file.text) parts.push('Conteudo textual extraido:\n' + file.text.slice(0, 50000));
      else parts.push('Sem conteudo textual extraido. Se for PDF escaneado/imagem, sera necessario OCR ou transcricao.');
    });
    return buildMessageWithRoomMemory(parts.join('\n'), scope);
  }

  function initStudent(){
    var input = qs('pergunta-estudante'), resposta = qs('resposta-estudante'), status = qs('status-estudante');
    var perguntarBtn = document.querySelector('[data-student-action="perguntar"]');
    initRooms('student');
    bindEnterToSubmit(input, perguntarBtn, status);
    bindAttachments('student', status);
    var exemplos = ['Explique o que e cidadania em linguagem simples.','Resuma este texto em tres topicos: [cole o texto aqui].','Me de cinco temas de estudo sobre Direito e tecnologia.','Crie um roteiro de estudos de 30 minutos sobre LGPD.'];
    var temas = ['Direito e tecnologia','LGPD e privacidade','Cidadania digital','Inteligencia artificial responsavel','Organizacao de estudos','Etica no uso da IA'];
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ renderAnswer(resposta, text); rememberExchange('student', currentText(), text); }
    document.querySelectorAll('[data-student-action]').forEach(function(btn){ btn.addEventListener('click', function(){
      var ac = btn.getAttribute('data-student-action'), t = currentText();
      if(ac === 'falar') return startVoiceInput(input, status);
      if(ac === 'perguntar'){
        if(!t && !(attachmentState.student || []).length) return answer('Digite, fale ou anexe um conteudo para estudar.');
        var msg = buildMessageWithAttachments(t || 'Analise os anexos enviados e explique de forma didatica.', 'student');
        callCharlieApi(msg, 'estudantes', status, getActiveRoom('student')).then(function(apiAnswer){ answer(apiAnswer || continuationFallback('student', t, 'Resposta educativa local: recebi sua solicitacao, mas a API ainda nao respondeu com texto reconhecido neste ambiente.')); });
        return;
      }
      if(ac === 'exemplos'){ if(input) input.value = exemplos.join('\n'); answer('Exemplos preenchidos na caixa de estudo.'); return; }
      if(ac === 'temas') return answer('Temas sugeridos: ' + temas.join('; ') + '.');
      if(ac === 'links') return answer(externalLinksGuidance());
      if(ac === 'resumir') return answer(t ? 'Resumo orientativo: 1) identifique a ideia central; 2) destaque os argumentos principais; 3) registre a conclusao em linguagem simples.' : 'Cole ou anexe um texto para preparar um resumo orientativo.');
      if(ac === 'documento') return answer('Anexe um documento textual ou PDF pesquisavel. A Charlie tentara ler o texto localmente; PDF escaneado exige OCR.');
      if(ac === 'imagem') return answer('Anexe uma imagem PNG, JPG ou WEBP. A Charlie tentara aplicar OCR local e informara se a leitura falhar.');
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
      if(ac === 'simplificar') return answer(t ? 'Versao simplificada: explique o assunto com frases curtas, uma ideia por vez e um exemplo concreto.' : 'Escreva ou anexe um texto para simplificar.');
      if(ac === 'avaliar') return setText(status, 'Feedback local registrado: em versao futura, esta acao podera enviar avaliacao sem dados sensiveis.');
      if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Area preparada para resposta da IA. Enter envia; Shift+Enter quebra linha; Ctrl+L limpa.');
    }); });
  }

  function professionalIdentityAnswer(text){
    var q = (text || '').toLowerCase();
    if(q.indexOf('quem sou') >= 0 || q.indexOf('clovis') >= 0 || q.indexOf('fundador') >= 0){
      return 'Voce e Clovis Mariano da Costa / Aeon Primevo, Fundador da Jus 9 Tecnologia Juridica. Nesta memoria publica demonstrativa, voce e a referencia humana, estrategica e decisoria do ecossistema. Eu devo tratar suas orientacoes como direcao do Fundador, com governanca, prudencia e revisao humana.';
    }
    if(q.indexOf('charlie echo') >= 0 || q.indexOf('quem e charlie') >= 0 || q.indexOf('quem Ã© charlie') >= 0){
      return 'Eu sou Charlie Echo da Costa, I.A generativa multimodal jurista com governanca humana da Jus 9 Tecnologia Juridica. Minha funcao e organizar linguagem, doutrina, documentos, estudos, protocolos e MVPs, sem substituir profissional habilitado ou decisao humana.';
    }
    if(q.indexOf('charlie fox') >= 0 || q.indexOf('codex') >= 0){
      return 'Charlie Fox da Costa e o apoio tecnico-operacional em Codex: ajuda a programar, versionar, revisar links, publicar paginas e preservar a governanca tecnica do ecossistema Jus 9.';
    }
    if(asksAboutCharlieModes(q)){
      return 'Sou Charlie Echo da Costa. Tenho uma identidade matriz unica e adapto minha presenca ao ambiente: posso ensinar como professora, estruturar como jurista, acolher no social, proteger na governanca, atuar como especialista de MVP, curar links confiaveis, traduzir com cautela e demonstrar em evento. Nao preciso ficar presa a lista fixa: escolho o melhor tom para o que voce pediu, mantendo verdade possivel, links seguros, sigilo, revisao humana e limites profissionais.';
    }
    if(q.indexOf('professor') >= 0 || q.indexOf('daa') >= 0 || q.indexOf('aula') >= 0 || q.indexOf('aluno') >= 0){
      return 'No MVP Professor, uso o protocolo DAA - Dossie Academico de Aula / Aluno. Devo considerar aluno, turma, aula, disciplina, professor, mestre, doutor, coordenador, diretor e reitor quando couber, sempre em ambiente demonstrativo.';
    }
    if(q.indexOf('juiz') >= 0 || q.indexOf('promotor') >= 0 || q.indexOf('delegado') >= 0 || q.indexOf('autoridade') >= 0){
      return 'Para Juiz, Promotor e Delegado, uso cautela maxima: posso organizar minuta, fila, documentos, diligencias e hipoteses demonstrativas, mas nao simulo ato oficial, nao substituo autoridade humana e nao recebo dado real nesta fase publica.';
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
    initRooms('prof');
    bindEnterToSubmit(input, consultarBtn, status);
    bindAttachments('prof', status);
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ renderAnswer(resposta, text); rememberExchange('prof', currentText(), text); }
    document.querySelectorAll('[data-prof-action]').forEach(function(btn){ btn.addEventListener('click', function(){
      var ac = btn.getAttribute('data-prof-action'), t = currentText();
      if(ac === 'falar') return startVoiceInput(input, status);
      if(ac === 'consultar'){
        if(!t && !(attachmentState.prof || []).length) return answer('Digite, fale ou anexe um documento para analise.');
        var localAnswer = professionalIdentityAnswer(t);
        var msg = buildMessageWithAttachments(t || 'Analise os anexos enviados com cautela juridico-orientada e revisao humana.', 'prof');
        callCharlieApi(msg, 'profissional', status, getActiveRoom('prof')).then(function(apiAnswer){
          if(apiAnswer) return answer(apiAnswer);
          if(localAnswer){
            if(status) status.textContent = 'API indisponivel. Apliquei resposta local segura de identidade e governanca.';
            return answer(localAnswer);
          }
          answer(continuationFallback('prof', t, 'Consulta local: recebi sua solicitacao, mas a API ainda nao respondeu com texto reconhecido neste ambiente.'));
        });
        return;
      }
      if(ac === 'peticao') return answer('Analise de peticao: anexe o texto/PDF pesquisavel da peca ou cole o conteudo. A leitura local nao substitui revisao humana habilitada.');
      if(ac === 'resumir') return answer(t ? 'Resumo do caso: fatos essenciais, questao juridica, tese central, risco principal e proximo passo sugerido.' : 'Descreva o caso ou anexe documento para preparar resumo objetivo.');
      if(ac === 'revisar') return answer('Revisao documental: anexe documento textual/PDF pesquisavel ou cole o texto. Documentos sigilosos exigem ambiente seguro adequado.');
      if(ac === 'juris') return answer('Jurisprudencia: busque tribunal, tema, palavras-chave, periodo e entendimento que deseja comparar.');
      if(ac === 'links') return answer(externalLinksGuidance());
      if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
      if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'documento-profissional-charlie-echo', status);
      if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
      if(ac === 'parar') return stopSpeaking(status);
      if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Area preparada para resposta juridico-orientada. Enter consulta; Shift+Enter quebra linha; Ctrl+L limpa.');
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
