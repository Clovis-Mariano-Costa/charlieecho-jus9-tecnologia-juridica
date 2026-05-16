(function(){
  function qs(id){ return document.getElementById(id); }
  function setText(el, text){ if(el) el.textContent = text; }
  function copyText(text, feedbackEl){
    if(!text) text = '';
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text)
        .then(()=>{ if(feedbackEl) feedbackEl.textContent = 'Conteúdo copiado para a área de transferência.'; })
        .catch(()=>{ if(feedbackEl) feedbackEl.textContent = 'Não foi possível copiar automaticamente. Copie manualmente.'; });
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
    const utter = new SpeechSynthesisUtterance(text || 'Não há texto para leitura.');
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

  function extractAnswer(data){
    if(!data) return '';
    if(typeof data === 'string') return data.trim();
    const candidates = [data.answer, data.resposta, data.response, data.output_text, data.text, data.content, data.message];
    for(const item of candidates){
      if(typeof item === 'string' && item.trim()) return item.trim();
    }
    if(Array.isArray(data.choices)){
      const msg = data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if(typeof msg === 'string' && msg.trim()) return msg.trim();
      const txt = data.choices[0] && data.choices[0].text;
      if(typeof txt === 'string' && txt.trim()) return txt.trim();
    }
    if(Array.isArray(data.output)){
      const parts = [];
      data.output.forEach(function(item){
        if(Array.isArray(item.content)){
          item.content.forEach(function(c){
            if(c && typeof c.text === 'string') parts.push(c.text);
          });
        }
      });
      const joined = parts.join('\n\n').trim();
      if(joined) return joined;
    }
    return '';
  }

  async function callCharlieApi(message, mode, statusEl){
    const endpoints = ['/api/ia', '/work/api/ia', '/api/work/ia'];
    let lastError = null;
    for(const endpoint of endpoints){
      try{
        if(statusEl) statusEl.textContent = 'Conectando Charlie Echo em ' + endpoint + '...';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, mode })
        });
        const raw = await res.text();
        let data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch(e) { data = { answer: raw }; }
        const answer = extractAnswer(data);
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
      if(statusEl) statusEl.textContent = 'Entrada por voz não disponível neste navegador. Use Chrome/Edge para testar.';
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = function(){ if(statusEl) statusEl.textContent = 'Ouvindo... fale agora.'; };
    rec.onerror = function(ev){ if(statusEl) statusEl.textContent = 'Não foi possível captar sua voz: ' + ev.error + '.'; };
    rec.onresult = function(ev){
      const transcript = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
      if(targetInput){
        targetInput.value = (targetInput.value ? targetInput.value + ' ' : '') + transcript;
        targetInput.focus();
      }
      if(statusEl) statusEl.textContent = 'Entrada por voz capturada com sucesso.';
    };
    rec.start();
  }

  function initStudent(){
    const input = qs('pergunta-estudante');
    const resposta = qs('resposta-estudante');
    const status = qs('status-estudante');
    const exemplos = [
      'Explique o que é cidadania em linguagem simples.',
      'Resuma este texto em três tópicos: [cole o texto aqui].',
      'Me dê cinco temas de estudo sobre Direito e tecnologia.',
      'Crie um roteiro de estudos de 30 minutos sobre LGPD.'
    ];
    const temas = [
      'Direito e tecnologia',
      'LGPD e privacidade',
      'Cidadania digital',
      'Inteligência artificial responsável',
      'Organização de estudos',
      'Ética no uso da IA'
    ];
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ setText(resposta, text); }
    document.querySelectorAll('[data-student-action]').forEach(function(btn){
      btn.addEventListener('click', function(){
        const ac = btn.getAttribute('data-student-action');
        const t = currentText();
        if(ac === 'falar') return startVoiceInput(input, status);
        if(ac === 'perguntar') { if(!t) return answer('Digite ou fale sua pergunta de estudo para continuar.'); callCharlieApi(t, 'estudantes', status).then(apiAnswer => answer(apiAnswer || 'Resposta educativa local: identifique o tema principal, a dúvida específica e um exemplo. A API ainda não respondeu com texto reconhecido neste ambiente.')); return; }
        if(ac === 'exemplos'){
          if(input) input.value = exemplos.join('\n');
          answer('Exemplos preenchidos na caixa de estudo.');
          return;
        }
        if(ac === 'temas') return answer('Temas sugeridos: ' + temas.join('; ') + '.');
        if(ac === 'resumir') return answer(t ? 'Resumo orientativo: 1) identifique a ideia central; 2) destaque os argumentos principais; 3) registre a conclusão em linguagem simples.' : 'Cole um texto para preparar um resumo orientativo.');
        if(ac === 'documento') return answer('Análise de documento: versão pública preparada para orientar leitura. Não envie dados sensíveis sem necessidade. A análise real deve ocorrer por backend seguro e, quando cabível, com revisão humana.');
        if(ac === 'imagem') return answer('Análise de imagem: descreva a imagem ou use futura função de upload seguro. Evite enviar documentos pessoais ou conteúdos sigilosos.');
        if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
        if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
        if(ac === 'parar') return stopSpeaking(status);
        if(ac === 'traduzir') return answer('Tradução preparada como função futura. Na versão pública atual, a página registra apenas a intenção e preserva seus dados no navegador.');
        if(ac === 'simplificar') return answer(t ? 'Versão simplificada: explique o assunto com frases curtas, uma ideia por vez e um exemplo concreto.' : 'Escreva um texto ou pergunta para simplificar.');
        if(ac === 'avaliar') return setText(status, 'Feedback local registrado: em versão futura, esta ação poderá enviar avaliação sem dados sensíveis.');
        if(ac === 'limpar'){
          if(input) input.value = '';
          answer('Área de resposta pronta para nova interação.');
          setText(status, 'Campos limpos.');
          return;
        }
      });
    });
  }

  function initProfessional(){
    const input = qs('consulta-profissional');
    const resposta = qs('resposta-profissional');
    const status = qs('status-profissional');
    function currentText(){ return input ? input.value.trim() : ''; }
    function answer(text){ setText(resposta, text); }
    document.querySelectorAll('[data-prof-action]').forEach(function(btn){
      btn.addEventListener('click', function(){
        const ac = btn.getAttribute('data-prof-action');
        const t = currentText();
        if(ac === 'falar') return startVoiceInput(input, status);
        if(ac === 'consultar') { if(!t) return answer('Digite ou fale sua consulta jurídica para continuar.'); callCharlieApi(t, 'profissional', status).then(apiAnswer => answer(apiAnswer || 'Consulta jurídica assistiva local: organize fatos, pedido, documentos e objetivo. A API ainda não respondeu com texto reconhecido neste ambiente.')); return; }
        if(ac === 'peticao') return answer('Análise de petição: verifique estrutura, fatos, fundamentos, pedidos, riscos processuais e clareza da redação. Não envie dados sigilosos em ambiente público.');
        if(ac === 'resumir') return answer(t ? 'Resumo do caso: fatos essenciais, questão jurídica, tese central, risco principal e próximo passo sugerido.' : 'Descreva o caso para preparar um resumo objetivo.');
        if(ac === 'revisar') return answer('Revisão documental: clareza, coerência, consistência terminológica, riscos e necessidade de revisão humana habilitada.');
        if(ac === 'juris') return answer('Jurisprudência: busque tribunal, tema, palavras-chave, período e entendimento que deseja comparar.');
        if(ac === 'copiar') return copyText(resposta ? resposta.textContent : '', status);
        if(ac === 'ouvir') return speakText(resposta ? resposta.textContent : '', status);
        if(ac === 'parar') return stopSpeaking(status);
        if(ac === 'limpar'){
          if(input) input.value = '';
          answer('Área de resposta profissional pronta para nova consulta.');
          setText(status, 'Campos limpos.');
          return;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(document.body.dataset.page === 'student'){ initStudent(); }
    if(document.body.dataset.page === 'professional'){ initProfessional(); }
  });
})();
