/* CidaoDEVMNN — Treino (PWA)
   Porta fiel da aba "Treino" do app desktop original (Tkinter),
   incluindo timers, rounds, descanso, progressão semanal e checkin. */

(() => {
  "use strict";

  // ---------------- Config (espelha as constantes do Python) ----------------
  const ROUNDS = 4;
  const DESCANSO = 25;
  const DESCANSO_ROUND = 60;
  const INTRO_TEMPO = 9;

  const TREINOS_SEMANA = {
    Iniciante: {
      0: [
        ["Prancha", "Core máximo, respire", 35, "prancha"],
        ["Abdominal bicicleta", "Cotovelo ao joelho oposto", 30, "abdominal"],
        ["Polichinelo", "Ritmo constante", 30, "polichinelo"],
        ["Prancha lateral dir.", "Quadril elevado", 30, "prancha_lateral"],
      ],
      1: [
        ["Flexão inclinada", "Desça 3s, empurre forte", 35, "flexao_inclinada"],
        ["Dead bug", "Lombar no chão, mova devagar", 30, "deadbug"],
        ["Agachamento", "Desça 3s, joelhos sobre os pés", 35, "agachamento"],
        ["Prancha", "Abdômen contraído, respire", 35, "prancha"],
      ],
      2: [
        ["Prancha lateral esq.", "Quadril elevado", 30, "prancha_lateral"],
        ["Mountain climber", "Ritmo moderado, core firme", 25, "mountain_climber"],
        ["Abdominal bicicleta", "Cotovelo toca joelho oposto", 30, "abdominal"],
        ["Polichinelo", "Ritmo constante", 30, "polichinelo"],
      ],
      3: [
        ["Flexão parede", "Corpo alinhado, cotovelos fechados", 35, "flexao_parede"],
        ["Bird dog", "Alterne, segure 2s", 30, "birddog"],
        ["Agachamento sumô", "Pés abertos, desça fundo", 35, "agachamento_sumo"],
        ["Prancha", "Quadril neutro, respire", 35, "prancha"],
      ],
      4: [
        ["Burpee leve", "Controle, sem impacto", 25, "burpee"],
        ["Mountain climber", "Alta intensidade, core firme", 25, "mountain_climber"],
        ["Abdominal bicicleta", "Cotovelo ao joelho oposto", 30, "abdominal"],
        ["Polichinelo", "Ritmo forte", 30, "polichinelo"],
      ],
      5: [
        ["Prancha lateral dir.", "Quadril elevado", 35, "prancha_lateral"],
        ["Prancha lateral esq.", "Quadril elevado", 35, "prancha_lateral"],
        ["Dead bug", "Lombar no chão, controle", 30, "deadbug"],
        ["Bird dog", "Alterne, segure 2s", 30, "birddog"],
      ],
      6: "DESCANSO",
    },
    Intermediario: {
      0: [
        ["Prancha", "Core máximo, 40s", 40, "prancha"],
        ["Abdominal bicicleta", "Cotovelo toca joelho oposto", 35, "abdominal"],
        ["Mountain climber", "Alta intensidade, core firme", 30, "mountain_climber"],
        ["Prancha lateral dir.", "Quadril elevado, 40s", 35, "prancha_lateral"],
      ],
      1: [
        ["Flexão padrão", "Desça 3s, exploda na subida", 40, "flexao"],
        ["Dead bug", "Lombar no chão, controle", 35, "deadbug"],
        ["Agachamento profundo", "Amplitude total, 3s descida", 40, "agachamento"],
        ["Prancha", "Respire, não prenda o ar", 40, "prancha"],
      ],
      2: [
        ["Prancha lateral esq.", "Quadril elevado, 40s", 35, "prancha_lateral"],
        ["Burpee", "Explosivo, controle na descida", 25, "burpee"],
        ["Abdominal bicicleta", "Cotovelo toca joelho oposto", 35, "abdominal"],
        ["Polichinelo", "Ritmo forte", 30, "polichinelo"],
      ],
      3: [
        ["Flexão declinada", "Pés elevados, mais carga", 40, "flexao"],
        ["Bird dog", "Alterne, segure 3s", 35, "birddog"],
        ["Agachamento sumô", "Amplitude total, explosão", 40, "agachamento_sumo"],
        ["Prancha lateral dir.", "Quadril elevado, 40s", 35, "prancha_lateral"],
      ],
      4: [
        ["Burpee", "Controle total", 25, "burpee"],
        ["Mountain climber", "Ritmo constante", 30, "mountain_climber"],
        ["Abdominal bicicleta", "Cotovelo toca joelho oposto", 35, "abdominal"],
        ["Polichinelo", "Ritmo forte", 30, "polichinelo"],
      ],
      5: [
        ["Prancha lateral dir.", "Quadril elevado, 40s", 35, "prancha_lateral"],
        ["Prancha lateral esq.", "Quadril elevado, 40s", 35, "prancha_lateral"],
        ["Dead bug", "Lombar no chão, controle", 35, "deadbug"],
        ["Super-homem isometria", "Peito e coxas fora do chão, segure", 35, "superman"],
      ],
      6: "DESCANSO",
    },
  };

  const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const NOMES_DIA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

  // ---------------- Persistência (equivalente a progress.txt / checkin.txt) ----------------
  const LS_PROGRESS = "cidao_progress_v1";
  const LS_CHECKIN = "cidao_checkin_v1";

  function pyWeekday(date = new Date()) {
    // JS getDay(): 0=Dom..6=Sáb  ->  Python weekday(): 0=Seg..6=Dom
    return (date.getDay() + 6) % 7;
  }

  function isoWeek(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const Progressao = {
    semana: 1,
    nivel: "Iniciante",
    deload: false,
    ultimoTreino: "",
    forcouDescanso: false,

    load() {
      try {
        const raw = localStorage.getItem(LS_PROGRESS);
        if (raw) Object.assign(this, JSON.parse(raw));
      } catch (e) { /* ignora */ }
    },
    save() {
      try {
        localStorage.setItem(LS_PROGRESS, JSON.stringify({
          semana: this.semana, nivel: this.nivel, deload: this.deload,
          ultimoTreino: this.ultimoTreino, forcouDescanso: this.forcouDescanso,
        }));
      } catch (e) { /* ignora */ }
    },
    jaTreinouHoje() { return this.ultimoTreino === todayStr(); },
    concluirSemana() {
      if (this.jaTreinouHoje()) return;
      this.ultimoTreino = todayStr();
      this.semana += 1;
      if (this.semana === 5) this.nivel = "Intermediario";
      if (this.semana === 9) this.deload = true;
      if (this.semana === 10) this.deload = false;
      this.forcouDescanso = false;
      this.save();
    },
    setForcarDescanso() { this.forcouDescanso = true; this.save(); },
    getSemanasRestantes() {
      if (this.deload) return `Semana de Deload — ${10 - this.semana} semanas restantes`;
      if (this.nivel === "Iniciante") return `Fase Iniciante — ${5 - this.semana} semanas restantes`;
      return `Fase Intermediário — ${10 - this.semana} semanas restantes`;
    },
  };

  const Checkin = {
    marcados: new Set(),
    semanaIso: null,
    load() {
      const atual = isoWeek();
      try {
        const raw = localStorage.getItem(LS_CHECKIN);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.semanaIso === atual) {
            this.marcados = new Set(data.marcados || []);
            this.semanaIso = atual;
            this.render();
            return;
          }
        }
      } catch (e) { /* ignora */ }
      this.marcados = new Set();
      this.semanaIso = atual;
      this.save();
    },
    save() {
      try {
        localStorage.setItem(LS_CHECKIN, JSON.stringify({
          semanaIso: this.semanaIso, marcados: Array.from(this.marcados),
        }));
      } catch (e) { /* ignora */ }
      this.render();
    },
    marcar() { this.marcados.add(pyWeekday()); this.save(); },
    desmarcar() { this.marcados.delete(pyWeekday()); this.save(); },
    render() {
      const wrap = document.getElementById("checkinDays");
      wrap.innerHTML = "";
      DIAS.forEach((d, i) => {
        const el = document.createElement("div");
        el.className = "checkin-day";
        const marcado = this.marcados.has(i);
        el.innerHTML = `<span class="dow">${d}</span><span class="mark" style="color:${marcado ? "var(--verde)" : "#444"}">${marcado ? "✅" : "⬜"}</span>`;
        wrap.appendChild(el);
      });
      const total = this.marcados.size, meta = 6;
      const statsEl = document.getElementById("checkinStats");
      if (total >= meta) {
        statsEl.textContent = `✅ Semana completa! ${total}/${meta} treinos`;
        statsEl.style.color = "var(--verde)";
      } else {
        statsEl.textContent = `📊 ${total}/${meta} treinos esta semana`;
        statsEl.style.color = "var(--texto-secundario)";
      }
    },
  };

  function ehDiaDescanso() {
    return TREINOS_SEMANA[Progressao.nivel][pyWeekday()] === "DESCANSO";
  }

  function obterTreino() {
    const dia = pyWeekday();
    let treino = TREINOS_SEMANA[Progressao.nivel][dia];
    if (treino === "DESCANSO") return null;
    if (Progressao.deload) {
      treino = treino.map(([n, d, t, g]) => [n, d, Math.round(t * 0.7), g]);
    }
    return treino;
  }

  // ---------------- Áudio ----------------
  const audioCache = {};
  let audioAtual = null;

  function playSound(nome) {
    const src = `assets/audio/${nome}.wav`;
    if (!audioCache[nome]) {
      const a = new Audio(src);
      a.preload = "auto";
      audioCache[nome] = a;
    }
    stopSound();
    const el = audioCache[nome];
    el.currentTime = 0;
    el.play().catch(() => { /* arquivo pode não existir (ex: final.wav) — ignora */ });
    audioAtual = el;
  }

  function stopSound() {
    if (audioAtual) {
      try { audioAtual.pause(); audioAtual.currentTime = 0; } catch (e) { /* ignora */ }
    }
  }

  // ---------------- Elementos ----------------
  const el = {
    checkin: document.getElementById("checkin"),
    infoText: document.getElementById("infoText"),
    previsaoText: document.getElementById("previsaoText"),
    diaNome: document.getElementById("diaNome"),
    avisoDescanso: document.getElementById("avisoDescanso"),
    lblRound: document.getElementById("lblRound"),
    lblNome: document.getElementById("lblNome"),
    lblExCount: document.getElementById("lblExCount"),
    lblDesc: document.getElementById("lblDesc"),
    progressLbl: document.getElementById("progressLbl"),
    progressBar: document.getElementById("progressBar"),
    ringArc: document.getElementById("ringArc"),
    lblTempo: document.getElementById("lblTempo"),
    video: document.getElementById("exVideo"),
    btnIniciar: document.getElementById("btnIniciar"),
    btnPausar: document.getElementById("btnPausar"),
    btnStop: document.getElementById("btnStop"),
    btnForcar: document.getElementById("btnForcar"),
    btnFullscreen: document.getElementById("btnFullscreen"),
  };

  const RING_CIRC = 2 * Math.PI * 60;

  // ---------------- Estado do treino ----------------
  const State = {
    seq: [],
    round: 1,
    i: 0,
    pausado: false,
    introMode: false,
    timerHandle: null,
    total: 0,
    t: 0,
    callback: null,
  };

  function setBtnIniciarAtivo(ativo) {
    el.btnIniciar.disabled = !ativo;
    el.btnPausar.disabled = ativo;
  }

  function infoText() {
    let txt = `Semana ${Progressao.semana} | ${Progressao.nivel}`;
    if (Progressao.deload) txt += " | ⚡ DELOAD";
    return txt;
  }

  function aplicarEstadoDoDia() {
    if (ehDiaDescanso() && !Progressao.forcouDescanso) {
      el.lblNome.textContent = "😴 Dia de Descanso";
      el.lblDesc.textContent = "Seu corpo recupera e fortalece agora.";
      el.avisoDescanso.textContent = "Domingo é descanso total. Sem treino hoje — essa pausa é parte do progresso, não uma falha.";
      el.btnIniciar.hidden = true;
      el.btnForcar.hidden = false;
    } else {
      el.avisoDescanso.textContent = "";
      el.btnForcar.hidden = true;
      el.btnIniciar.hidden = false;
      if (ehDiaDescanso() && Progressao.forcouDescanso) {
        el.avisoDescanso.textContent = "⚠️ Você escolheu treinar mesmo no dia de descanso. Respeite seu corpo.";
      }
    }
  }

  function refreshHeader() {
    el.infoText.textContent = infoText();
    el.previsaoText.textContent = Progressao.getSemanasRestantes();
    el.diaNome.textContent = NOMES_DIA[pyWeekday()];
  }

  function loadVideo(nome) {
    const src = `assets/gifs/${nome}.mp4`;
    if (el.video.getAttribute("data-nome") === nome) {
      el.video.play().catch(() => {});
      return;
    }
    el.video.setAttribute("data-nome", nome);
    el.video.src = src;
    el.video.load();
    el.video.play().catch(() => {});
  }

  // ---------------- Fluxo do treino (espelha start/intro/run_ex/rest/...) ----------------
  function start() {
    if (!window.confirm("Ambiente seguro?\nIniciar treino?")) return;
    State.seq = obterTreino() || [["Bird dog", "Movimento lento, equilíbrio", 30, "birddog"]];
    State.round = 1;
    State.i = 0;
    State.pausado = false;
    el.btnPausar.disabled = false;
    el.btnPausar.textContent = "⏸ PAUSAR";
    el.btnPausar.className = "btn btn-warn";
    setBtnIniciarAtivo(false);
    el.progressBar.style.width = "0%";
    el.progressLbl.textContent = "Progresso: 0%";
    intro();
  }

  function intro() {
    stopSound();
    State.introMode = true;
    el.lblRound.textContent = "";
    el.lblNome.textContent = "Preparando treino…";
    el.lblExCount.textContent = "";
    el.lblDesc.textContent = "";
    loadVideo("preparando");
    playSound("time");
    runTimer(INTRO_TEMPO, startExercises);
  }

  function startExercises() {
    State.introMode = false;
    runEx();
  }

  function runEx() {
    if (State.i >= State.seq.length) { afterRound(); return; }
    stopSound();
    const [nome, desc, tempo, gif] = State.seq[State.i];
    el.lblRound.textContent = `Round ${State.round} de ${ROUNDS}`;
    el.lblNome.textContent = nome;
    el.lblExCount.textContent = `Exercício ${State.i + 1} de ${State.seq.length}`;
    el.lblDesc.textContent = desc;
    loadVideo(gif);
    const totalExercicios = State.seq.length * ROUNDS;
    const exAtual = (State.round - 1) * State.seq.length + State.i + 1;
    const progresso = (exAtual / totalExercicios) * 100;
    el.progressBar.style.width = `${progresso}%`;
    el.progressLbl.textContent = `Progresso: ${Math.round(progresso)}%`;
    runTimer(tempo, afterEx);
  }

  function afterEx() {
    State.i += 1;
    if (State.i >= State.seq.length) afterRound();
    else rest();
  }

  function rest() {
    stopSound();
    el.lblRound.textContent = `Round ${State.round} de ${ROUNDS}`;
    el.lblNome.textContent = "💧 Descanso";
    el.lblExCount.textContent = `Próximo: ${State.seq[State.i][0]}`;
    el.lblDesc.textContent = "Respire fundo";
    loadVideo("descanso");
    runTimer(DESCANSO, runEx);
  }

  function afterRound() {
    stopSound();
    if (State.round < ROUNDS) {
      State.round += 1;
      State.i = 0;
      el.lblRound.textContent = `Iniciando Round ${State.round}`;
      el.lblNome.textContent = "🔄 Descanso entre rounds";
      el.lblExCount.textContent = "";
      el.lblDesc.textContent = "Hidrate-se! Caminhe um pouco.";
      loadVideo("descanso");
      runTimer(DESCANSO_ROUND, runEx);
    } else {
      finish();
    }
  }

  function finish() {
    stopSound();
    el.lblRound.textContent = "";
    el.lblNome.textContent = "🏆 Treino concluído!";
    el.lblExCount.textContent = "";
    el.lblDesc.textContent = "Parabéns!";
    el.ringArc.style.strokeDashoffset = "0";
    el.lblTempo.textContent = "";
    el.progressBar.style.width = "100%";
    el.progressLbl.textContent = "Progresso: 100% 🎉";
    loadVideo("final");
    playSound("final");
    Checkin.marcar();
    Progressao.concluirSemana();
    refreshHeader();
    setBtnIniciarAtivo(true);
    el.btnPausar.disabled = true;
  }

  function resetTotal() {
    if (!window.confirm("Cancelar treino\nDeseja realmente cancelar o treino atual?\nO progresso de hoje será perdido.")) return;
    clearTimeout(State.timerHandle);
    State.timerHandle = null;
    stopSound();
    State.pausado = false;
    el.btnPausar.disabled = true;
    el.btnPausar.textContent = "⏸ PAUSAR";
    el.btnPausar.className = "btn btn-warn";
    el.lblRound.textContent = "";
    el.lblNome.textContent = "Treino cancelado";
    el.lblExCount.textContent = "";
    el.lblDesc.textContent = "";
    el.lblTempo.textContent = "";
    el.ringArc.style.strokeDashoffset = String(RING_CIRC);
    el.video.removeAttribute("src");
    el.video.removeAttribute("data-nome");
    el.progressBar.style.width = "0%";
    el.progressLbl.textContent = "Progresso: 0%";
    Checkin.desmarcar();
    setBtnIniciarAtivo(true);
    aplicarEstadoDoDia();
  }

  function pausarTreino() {
    if (!State.pausado) {
      State.pausado = true;
      clearTimeout(State.timerHandle);
      State.timerHandle = null;
      stopSound();
      el.btnPausar.textContent = "▶ RETOMAR";
      el.btnPausar.className = "btn";
      el.btnPausar.style.background = "var(--verde)";
      el.btnPausar.style.color = "#000";
      el.lblRound.textContent = "⏸ Treino pausado";
    } else {
      State.pausado = false;
      el.btnPausar.textContent = "⏸ PAUSAR";
      el.btnPausar.className = "btn btn-warn";
      el.btnPausar.style.background = "";
      el.btnPausar.style.color = "";
      tick();
    }
  }

  function runTimer(total, callback) {
    State.total = total;
    State.t = total;
    State.callback = callback;
    tick();
  }

  function tick() {
    if (State.pausado) return;
    el.lblTempo.textContent = String(State.t);
    const offset = RING_CIRC * (1 - State.t / State.total);
    el.ringArc.style.strokeDashoffset = String(offset);
    if (!State.introMode && State.t > 0 && State.t <= 5) {
      playSound(String(State.t));
    }
    if (State.t <= 0) {
      State.callback();
    } else {
      State.t -= 1;
      State.timerHandle = setTimeout(tick, 1000);
    }
  }

  // ---------------- Fullscreen imersivo ----------------
  function toggleFullscreen() {
    const doc = document.documentElement;
    if (!document.fullscreenElement) {
      (doc.requestFullscreen || doc.webkitRequestFullscreen || function(){}).call(doc);
      document.body.classList.add("fs-mode");
      el.btnFullscreen.textContent = "⤡";
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
      document.body.classList.remove("fs-mode");
      el.btnFullscreen.textContent = "⛶";
    }
  }
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove("fs-mode");
      el.btnFullscreen.textContent = "⛶";
    }
  });

  // ---------------- Ligações de eventos ----------------
  el.btnIniciar.addEventListener("click", start);
  el.btnPausar.addEventListener("click", pausarTreino);
  el.btnStop.addEventListener("click", resetTotal);
  el.btnForcar.addEventListener("click", () => {
    if (!window.confirm("Tem certeza?\nHoje é seu dia de descanso total.\n\nPular o descanso com frequência atrapalha exatamente o resultado que você busca.\n\nQuer treinar mesmo assim, só por hoje?")) return;
    Progressao.setForcarDescanso();
    el.btnForcar.hidden = true;
    el.btnIniciar.hidden = false;
    el.avisoDescanso.textContent = "⚠️ Você escolheu treinar mesmo no dia de descanso. Respeite seu corpo.";
    el.lblNome.textContent = "⚠️ Treino Forçado";
    el.lblDesc.textContent = "Lembre-se: descanso é parte do treino.";
  });
  el.btnFullscreen.addEventListener("click", toggleFullscreen);

  // ---------------- Inicialização ----------------
  Progressao.load();
  Checkin.load();
  refreshHeader();
  aplicarEstadoDoDia();
  el.ringArc.style.strokeDashoffset = String(RING_CIRC);

  // Registra o service worker (uso offline / instalação como app)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
