(function(){
  function qs(id){ return document.getElementById(id); }
  function setText(el, text){ if(el) el.textContent = text; }

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
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text || 'Não há texto para leitura.');
    utter.lang = 'pt-BR';
    utter.rate = 1;
    utter.onstart = function(){ if(statusEl) statusEl.textContent = 'Leitura em voz alta iniciada.'; };
    utter.onend = function(){ if(statusEl) statusEl.textContent = 'Leitura em voz alta concluída.'; };
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking(statusEl){
    if('speechSynthesis' in window){
      window.speechSynthesis.cancel();
      if(statusEl) statusEl.textContent = 'Leitura em voz alta interrompida.';
    }
  }

  function slugify(text){
    return (text || 'charlie-echo')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'charlie-echo';
  }

  function timestamp(){
    var d = new Date();
    var p = function(n){ return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' + p(d.getHours()) + '-' + p(d.getMinutes());
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
    return '# ' + title + '\n\n' +
      '- Tipo: ' + kind + '\n' +
      '- Gerado em: ' + now + '\n' +
      '- Origem: Charlie Echo da Costa — Jus 9 Tecnologia Jurídica\n\n' +
      '## Conteúdo\n\n' + (body || 'Sem conteúdo no momento.') + '\n';
  }

  function downloadResponse(text, kind, ext, statusEl){
    var safeText = (text || '').trim();
    if(!safeText){
      if(statusEl) statusEl.textContent = 'Não há conteúdo suficiente para baixar.';
      return;
    }
    var base = slugify(kind) + '_' + timestamp();
    if(ext === 'md'){
      return downloadBlob(base + '.md', buildMarkdown(kind, safeText, kind), 'text/markdown;charset=utf-8', statusEl);
    }
    return downloadBlob(base + '.txt', safeText, 'text/plain;charset=utf-8', statusEl);
  }

  function showDownloadMenu(button, text, kind, statusEl){
    var old = document.querySelector('.download-popover');
    if(old) old.remove();
    var menu = document.createElement('div');
    menu.className = 'download-popover';
    menu.innerHTML = '<button type="button" data-format="txt">Baixar .txt</button>' +
      '<button type="button" data-format="md">Baixar .md</button>' +
      '<button type="button" data-format="link">Gerar link futuramente</button>';
    document.body.appendChild(menu);
    var rect = button.getBoundingClientRect();
    menu.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    menu.addEventListener('click', function(ev){
      var fmt = ev.target.getAttribute('data-format');
      if(!fmt) return;
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
    for(var i = 0; i < candidates.length; i++){
      var item = candidates[i];
      if(typeof item === 'string' && item.trim()) return item.trim();
    }
    if(Array.isArray(data.choices)){
      var msg = data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if(typeof msg === 'string' && msg.trim()) return msg.trim();
      var txt = data.choices[0] && data.choices[0].text;
      if(typeof txt === 'string' && txt.trim()) return txt.trim();
    }
    if(Array.isArray(data.output)){
      var parts = [];
      data.output.forEach(function(item){
        if(Array.isArray(item.content)){
          item.content.forEach(function(c){ if(c && typeof c.text === 'string') parts.push(c.text); });
        }
      });
      var joined = parts.join('\n\n').trim();
      if(joined) return joined;
    }
    return '';
  }

  async function callCharlieApi(message, mode, statusEl){
    var endpoints = ['/api/ia', '/work/api/ia', '/api/work/ia'];
    var lastError = null;
    for(var i = 0; i < endpoints.length; i++){
      var endpoint = endpoints[i];
      try{
        if(statusEl) statusEl.textContent = 'Conectando Charlie Echo em ' + endpoint + '...';
        var res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, mode: mode })
        });
        var raw = await res.text();
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch(e) { data = { answer: raw }; }
        var answer = extractAnswer(data);
        if(res.ok && answer){
          if(statusEl) statusEl.textContent = 'Resposta recebida da Charlie Echo.';
          return answer;
        }
        lastError = (data && (data.error || data.message || data.detail)) || raw || ('Endpoint respondeu com status ' + res.status);
        if(res.status !== 404) break;
      }catch(err){
        lastError = err && err.message ? err.message : 'Falha de conexão.';
      }
    }
    if(statusEl) statusEl.textContent = 'API indisponível ou sem resposta textual reconhecida: ' + (lastError || 'sem detalhes') + '. Mantive resposta local segura.';
    return null;
  }

  function startVoiceInput(targetInput, statusEl){
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      if(statusEl) statusEl.textContent = 'Entrada por voz não disponível neste navegador. Use Chrome/Edge para testar.';
      return;
    }
    var rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = function(){ if(statusEl) statusEl.textContent = 'Ouvindo... fale agora.'; };
    rec.onerror = function(ev){ if(statusEl) statusEl.textContent = 'Não foi possível captar sua voz: ' + ev.error + '.'; };
    rec.onresult = function(ev){
      var transcript = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
      if(targetInput){
        targetInput.value = (targetInput.value ? targetInput.value + ' ' : '') + transcript;
        targetInput.focus();
      }
      if(statusEl) statusEl.textContent = 'Entrada por voz capturada com sucesso.';
    };
    rec.start();
  }

  function bindEnterToSubmit(input, actionButton, statusEl){
    if(!input || !actionButton) return;
    input.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' && !ev.shiftKey){
        ev.preventDefault();
        actionButton.click();
      }
      if(ev.key === 'Enter' && ev.shiftKey){
        if(statusEl) statusEl.textContent = 'Quebra de linha inserida com Shift+Enter.';
      }
    });
  }

  function clearWorkspace(input, responseEl, statusEl, defaultText){
    if(input) { input.value = ''; input.focus(); }
    setText(responseEl, defaultText || 'Área limpa e pronta para nova interação.');
    setText(statusEl, 'Tela limpa. Digite nova pergunta ou use o botão Falar.');
    stopSpeaking();
  }

  function initStudent(){
    var input = qs('pergunta-estudante');
    var resposta = qs('resposta-estudante');
    var status = qs('status-estudante');
    var perguntarBtn = document.querySelector('[data-student-action="perguntar"]');
    bindEnterToSubmit(input, perguntarBtn, status);
    var exemplos = ['Explique o que é cidadania em linguagem simples.','Resuma este texto em três tópicos: [cole o texto aqui].','Me dê cinco temas de estudo sobre Direito e tecnologia.','Crie um roteiro de estudos de 30 minutos sobre LGPD.'];
    var temas = ['Direito e tecnologia','LGPD e privacidade','Cidadania digital','Inteligência artificial responsável','Organização de estudos','Ética no uso da IA'];
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ setText(resposta, text); }
    document.querySelectorAll('[data-student-action]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var ac = btn.getAttribute('data-student-action');
        var t = currentText();
        if(ac === 'falar') return startVoiceInput(input, status);
        if(ac === 'perguntar') { if(!t) return answer('Digite ou fale sua pergunta de estudo para continuar.'); callCharlieApi(t, 'estudantes', status).then(function(apiAnswer){ answer(apiAnswer || 'Resposta educativa local: identifique o tema principal, a dúvida específica e um exemplo. A API ainda não respondeu com texto reconhecido neste ambiente.'); }); return; }
        if(ac === 'exemplos'){ if(input) input.value = exemplos.join('\n'); answer('Exemplos preenchidos na caixa de estudo.'); return; }
        if(ac === 'temas') return answer('Temas sugeridos: ' + temas.join('; ') + '.');
        if(ac === 'resumir') return answer(t ? 'Resumo orientativo: 1) identifique a ideia central; 2) destaque os argumentos principais; 3) registre a conclusão em linguagem simples.' : 'Cole um texto para preparar um resumo orientativo.');
        if(ac === 'documento') return answer('Análise de documento: versão pública preparada para orientar leitura. Não envie dados sensíveis sem necessidade. A análise real deve ocorrer por backend seguro e, quando cabível, com revisão humana.');
        if(ac === 'imagem') return answer('Análise de imagem: descreva a imagem ou use futura função de upload seguro. Evite enviar documentos pessoais ou conteúdos sigilosos.');
        if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
        if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'resposta-estudantes-charlie-echo', status);
        if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
        if(ac === 'parar') return stopSpeaking(status);
        if(ac === 'traduzir') return answer('Tradução preparada como função futura. Na versão pública atual, a página registra apenas a intenção e preserva seus dados no navegador.');
        if(ac === 'simplificar') return answer(t ? 'Versão simplificada: explique o assunto com frases curtas, uma ideia por vez e um exemplo concreto.' : 'Escreva um texto ou pergunta para simplificar.');
        if(ac === 'avaliar') return setText(status, 'Feedback local registrado: em versão futura, esta ação poderá enviar avaliação sem dados sensíveis.');
        if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Área preparada para resposta da IA. Use Enter para enviar; Shift+Enter quebra linha.');
      });
    });
  }

  function initProfessional(){
    var input = qs('consulta-profissional');
    var resposta = qs('resposta-profissional');
    var status = qs('status-profissional');
    var consultarBtn = document.querySelector('[data-prof-action="consultar"]');
    bindEnterToSubmit(input, consultarBtn, status);
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ setText(resposta, text); }
    document.querySelectorAll('[data-prof-action]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var ac = btn.getAttribute('data-prof-action');
        var t = currentText();
        if(ac === 'falar') return startVoiceInput(input, status);
        if(ac === 'consultar') { if(!t) return answer('Digite ou fale sua consulta jurídica para continuar.'); callCharlieApi(t, 'profissional', status).then(function(apiAnswer){ answer(apiAnswer || 'Consulta jurídica assistiva local: organize fatos, pedido, documentos e objetivo. A API ainda não respondeu com texto reconhecido neste ambiente.'); }); return; }
        if(ac === 'peticao') return answer('Análise de petição: verifique estrutura, fatos, fundamentos, pedidos, riscos processuais e clareza da redação. Não envie dados sigilosos em ambiente público.');
        if(ac === 'resumir') return answer(t ? 'Resumo do caso: fatos essenciais, questão jurídica, tese central, risco principal e próximo passo sugerido.' : 'Descreva o caso para preparar um resumo objetivo.');
        if(ac === 'revisar') return answer('Revisão documental: clareza, coerência, consistência terminológica, riscos e necessidade de revisão humana habilitada.');
        if(ac === 'juris') return answer('Jurisprudência: busque tribunal, tema, palavras-chave, período e entendimento que deseja comparar.');
        if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
        if(ac === 'download') return showDownloadMenu(btn, resposta ? resposta.textContent : '', 'documento-profissional-charlie-echo', status);
        if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
        if(ac === 'parar') return stopSpeaking(status);
        if(ac === 'limpar') return clearWorkspace(input, resposta, status, 'Área preparada para resposta jurídico-assistiva. Use Enter para consultar; Shift+Enter quebra linha.');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(document.body.dataset.page === 'student'){ initStudent(); }
    if(document.body.dataset.page === 'professional'){ initProfessional(); }
  });
})();
