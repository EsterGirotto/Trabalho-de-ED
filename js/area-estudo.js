const AREA_TOPICOS = {
  geral: "Fundamentos",
  tad: "TAD",
  simples: "Lista Simples",
  dupla: "Lista Dupla",
  revisao: "Revisão"
};

const AREA_ETAPAS = [
  { id: "fundamentos", titulo: "Fundamentos", texto: "Entender o que são estruturas de dados e por que elas importam.", link: "entrega.html" },
  { id: "tad", titulo: "TAD", texto: "Separar interface, implementação e regras internas.", link: "tad.html" },
  { id: "simples", titulo: "Lista Simples", texto: "Praticar nós com dado e referência para o próximo elemento.", link: "lista-simples.html" },
  { id: "dupla", titulo: "Lista Dupla", texto: "Comparar navegação em dois sentidos e custo de memória.", link: "lista-dupla.html" },
  { id: "pratica", titulo: "Prática", texto: "Usar os simuladores para inserir, buscar e remover valores.", link: "lista-simples.html#simulador" },
  { id: "revisao", titulo: "Revisão Final", texto: "Responder quiz, revisar erros comuns e fechar a trilha.", link: "revisao.html" }
];

const AREA_QUIZ = {
  tad: [
    { pergunta: "O que um TAD destaca?", opcoes: ["Apenas a cor da interface", "Dados e operações disponíveis", "Somente o banco de dados"], resposta: 1 },
    { pergunta: "Qual ideia está ligada ao TAD?", opcoes: ["Encapsulamento", "Desorganização", "Duplicação obrigatória"], resposta: 0 },
    { pergunta: "Por que separar interface e implementação?", opcoes: ["Para dificultar o uso", "Para permitir mudanças internas sem quebrar o uso externo", "Para remover métodos"], resposta: 1 }
  ],
  simples: [
    { pergunta: "O que existe em um nó de lista simples?", opcoes: ["Dado e próximo", "Anterior, dado e próximo", "Apenas índice"], resposta: 0 },
    { pergunta: "Como normalmente ocorre uma busca?", opcoes: ["Acesso direto por índice", "Percorrendo nó por nó", "Sempre em O(1)"], resposta: 1 },
    { pergunta: "O último nó aponta para:", opcoes: ["O primeiro nó", "null", "Ele mesmo"], resposta: 1 }
  ],
  dupla: [
    { pergunta: "O que diferencia a lista dupla?", opcoes: ["Ela não usa nós", "Cada nó tem anterior e próximo", "Ela só armazena texto"], resposta: 1 },
    { pergunta: "Qual vantagem da lista dupla?", opcoes: ["Navegar nos dois sentidos", "Eliminar memória", "Buscar sempre em O(1)"], resposta: 0 },
    { pergunta: "Qual cuidado é essencial?", opcoes: ["Atualizar apenas o próximo", "Atualizar anterior e próximo corretamente", "Nunca testar lista vazia"], resposta: 1 }
  ],
  revisao: [
    { pergunta: "Qual estrutura permite voltar ao elemento anterior naturalmente?", opcoes: ["Lista simples", "Lista dupla", "Vetor fixo sempre"], resposta: 1 },
    { pergunta: "Qual conceito protege detalhes internos?", opcoes: ["TAD", "Null", "Scroll"], resposta: 0 },
    { pergunta: "Inserir no início da lista simples costuma ser:", opcoes: ["O(1)", "O(n²)", "Impossível"], resposta: 0 }
  ]
};

const AREA_DESAFIOS = [
  { id: "simples-montar", texto: "Monte no simulador uma lista simples com 10, 20 e 30." },
  { id: "simples-remover", texto: "Remova o valor 20 e explique qual referência mudou." },
  { id: "dupla-voltar", texto: "Na lista dupla, use a ideia de anterior para explicar a navegação reversa." },
  { id: "comparar", texto: "Escreva uma diferença entre lista simples e lista dupla nas anotações." }
];

document.addEventListener("DOMContentLoaded", iniciarAreaDeEstudo);

async function iniciarAreaDeEstudo() {
  if (!document.body.dataset.studyPage) {
    return;
  }

  try {
    const status = await buscarStatus();

    if (!status.autenticado) {
      return;
    }

    const contexto = {
      usuario: status.usuario,
      chave: "ed-area-estudo:" + status.usuario.email,
      estado: carregarEstado("ed-area-estudo:" + status.usuario.email)
    };

    preencherUsuarioArea(contexto);
    renderizarResumoCompacto(contexto);

    const pagina = document.body.dataset.studyPage;

    if (pagina === "dashboard") renderizarDashboard(contexto);
    if (pagina === "trilha") renderizarTrilha(contexto);
    if (pagina === "cronometro") iniciarCronometro(contexto);
    if (pagina === "quiz") iniciarQuiz(contexto);
    if (pagina === "anotacoes") iniciarAnotacoes(contexto);
    if (pagina === "revisao") iniciarRevisao(contexto);
    if (pagina !== "cronometro") iniciarResumoAoVivo(contexto);
  } catch (erro) {
    console.warn("Nao foi possivel iniciar a area de estudos.", erro);
  }
}

function estadoPadrao() {
  return {
    tempos: { geral: 0, tad: 0, simples: 0, dupla: 0, revisao: 0 },
    cronometro: { ativo: null },
    trilha: {},
    quiz: {},
    anotacoes: {},
    desafios: {},
    atualizadoEm: null
  };
}

function carregarEstado(chave) {
  const padrao = estadoPadrao();
  const salvo = localStorage.getItem(chave);

  if (!salvo) {
    return padrao;
  }

  try {
    const dados = JSON.parse(salvo);

    return {
      ...padrao,
      ...dados,
      tempos: { ...padrao.tempos, ...(dados.tempos || {}) },
      cronometro: { ...padrao.cronometro, ...(dados.cronometro || {}) },
      trilha: { ...padrao.trilha, ...(dados.trilha || {}) },
      quiz: { ...padrao.quiz, ...(dados.quiz || {}) },
      anotacoes: { ...padrao.anotacoes, ...(dados.anotacoes || {}) },
      desafios: { ...padrao.desafios, ...(dados.desafios || {}) }
    };
  } catch (erro) {
    localStorage.removeItem(chave);
    return padrao;
  }
}

function salvarEstado(contexto) {
  contexto.estado.atualizadoEm = new Date().toISOString();
  localStorage.setItem(contexto.chave, JSON.stringify(contexto.estado));
  renderizarResumoCompacto(contexto);
}

function preencherUsuarioArea(contexto) {
  document.querySelectorAll("[data-area-user]").forEach(function (item) {
    item.textContent = contexto.usuario.nome;
  });
}

function totalSegundos(contexto) {
  const salvo = Object.values(contexto.estado.tempos || {}).reduce(function (soma, valor) {
    return soma + Number(valor || 0);
  }, 0);

  return salvo + segundosCronometroAtivo(contexto);
}

function etapasConcluidas(contexto) {
  return AREA_ETAPAS.filter(function (etapa) {
    return contexto.estado.trilha && contexto.estado.trilha[etapa.id];
  }).length;
}

function melhorNota(contexto) {
  const notas = Object.values(contexto.estado.quiz || {}).map(function (item) {
    return Number(item.melhor || 0);
  });
  return notas.length ? Math.max(...notas) : 0;
}

function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const seg = segundos % 60;
  return String(horas).padStart(2, "0") + ":" + String(minutos).padStart(2, "0") + ":" + String(seg).padStart(2, "0");
}

function obterCronometro(contexto) {
  contexto.estado.cronometro = contexto.estado.cronometro || { ativo: null };
  return contexto.estado.cronometro;
}

function cronometroAtivo(contexto) {
  const ativo = obterCronometro(contexto).ativo;

  if (!ativo || !AREA_TOPICOS[ativo.topico] || Number.isNaN(Date.parse(ativo.iniciadoEm))) {
    return null;
  }

  return ativo;
}

function segundosCronometroAtivo(contexto) {
  const ativo = cronometroAtivo(contexto);

  if (!ativo) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - Date.parse(ativo.iniciadoEm)) / 1000));
}

function tempoDoTopico(contexto, topico) {
  const salvo = Number(contexto.estado.tempos[topico] || 0);
  const ativo = cronometroAtivo(contexto);

  if (!ativo || ativo.topico !== topico) {
    return salvo;
  }

  return salvo + segundosCronometroAtivo(contexto);
}

function finalizarCronometroAtivo(contexto) {
  const ativo = cronometroAtivo(contexto);

  if (!ativo) {
    obterCronometro(contexto).ativo = null;
    return 0;
  }

  const delta = segundosCronometroAtivo(contexto);
  contexto.estado.tempos[ativo.topico] = Number(contexto.estado.tempos[ativo.topico] || 0) + delta;
  obterCronometro(contexto).ativo = null;
  salvarEstado(contexto);

  return delta;
}

function renderizarResumoCompacto(contexto) {
  const total = totalSegundos(contexto);
  const etapas = etapasConcluidas(contexto);
  const ativo = cronometroAtivo(contexto);

  preencherTexto("[data-area-total-time]", formatarTempo(total));
  preencherTexto("[data-area-steps]", etapas + "/" + AREA_ETAPAS.length);
  preencherTexto("[data-area-best-score]", melhorNota(contexto) + "%");
  preencherTexto("[data-area-timer-state]", ativo ? "Rodando" : "Pausado");
  preencherTexto("[data-area-active-topic]", ativo ? AREA_TOPICOS[ativo.topico] : "Nenhum");
}

function preencherTexto(seletor, texto) {
  document.querySelectorAll(seletor).forEach(function (item) {
    item.textContent = texto;
  });
}

function iniciarResumoAoVivo(contexto) {
  if (!cronometroAtivo(contexto)) {
    return;
  }

  setInterval(function () {
    renderizarResumoCompacto(contexto);
  }, 1000);
}

function renderizarDashboard(contexto) {
  const proxima = AREA_ETAPAS.find(function (etapa) {
    return !contexto.estado.trilha[etapa.id];
  }) || AREA_ETAPAS[AREA_ETAPAS.length - 1];

  preencherTexto("[data-dashboard-next]", proxima.titulo);
  preencherTexto("[data-dashboard-notes]", Object.values(contexto.estado.anotacoes || {}).filter(Boolean).length);

  const lista = document.querySelector("[data-dashboard-trail]");
  if (lista) {
    lista.innerHTML = AREA_ETAPAS.map(function (etapa) {
      const feita = contexto.estado.trilha[etapa.id];
      return `<li class="${feita ? "done" : ""}"><span>${feita ? "✓" : "•"}</span>${etapa.titulo}</li>`;
    }).join("");
  }
}

function renderizarTrilha(contexto) {
  const lista = document.querySelector("[data-trail-list]");

  if (!lista) {
    return;
  }

  lista.innerHTML = AREA_ETAPAS.map(function (etapa, indice) {
    const feita = contexto.estado.trilha[etapa.id];
    return `
      <article class="trail-card ${feita ? "done" : ""}">
        <div class="trail-index">${indice + 1}</div>
        <div>
          <h3>${etapa.titulo}</h3>
          <p>${etapa.texto}</p>
          <div class="trail-actions">
            <a class="button tool" href="${etapa.link}">Abrir</a>
            <button class="button primary" type="button" data-toggle-step="${etapa.id}">${feita ? "Marcar como pendente" : "Marcar concluído"}</button>
          </div>
        </div>
      </article>`;
  }).join("");

  lista.querySelectorAll("[data-toggle-step]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      const id = botao.dataset.toggleStep;
      contexto.estado.trilha[id] = !contexto.estado.trilha[id];
      salvarEstado(contexto);
      renderizarTrilha(contexto);
    });
  });
}

function iniciarCronometro(contexto) {
  const display = document.querySelector("[data-timer-display]");
  const totalTopico = document.querySelector("[data-topic-total]");
  const status = document.querySelector("[data-timer-status]");
  const select = document.querySelector("[data-timer-topic]");
  const start = document.querySelector("[data-timer-start]");
  const pause = document.querySelector("[data-timer-pause]");
  const reset = document.querySelector("[data-timer-reset]");
  let intervalo = null;

  function renderizar() {
    const ativo = cronometroAtivo(contexto);

    if (ativo && select) {
      select.value = ativo.topico;
    }

    const topicoAtual = select ? select.value : "geral";

    if (display) display.textContent = formatarTempo(ativo ? segundosCronometroAtivo(contexto) : 0);
    if (totalTopico) totalTopico.textContent = formatarTempo(tempoDoTopico(contexto, topicoAtual));
    if (status) {
      status.textContent = ativo
        ? "Cronometro rodando em " + AREA_TOPICOS[ativo.topico] + "."
        : "Cronometro pausado.";
      status.classList.toggle("active", !!ativo);
    }
    if (start) {
      start.disabled = !!ativo;
      start.textContent = ativo ? "Rodando" : "Iniciar";
    }
    if (pause) pause.disabled = !ativo;
    if (reset) reset.disabled = !ativo;
    renderizarResumoCompacto(contexto);
  }

  function ligarAtualizacao() {
    clearInterval(intervalo);
    intervalo = setInterval(renderizar, 1000);
  }

  if (start) {
    start.addEventListener("click", function () {
      if (cronometroAtivo(contexto)) return;

      obterCronometro(contexto).ativo = {
        topico: select ? select.value : "geral",
        iniciadoEm: new Date().toISOString()
      };
      salvarEstado(contexto);
      ligarAtualizacao();
      renderizar();
    });
  }

  if (pause) {
    pause.addEventListener("click", function () {
      finalizarCronometroAtivo(contexto);
      clearInterval(intervalo);
      intervalo = null;
      renderizar();
    });
  }

  if (reset) {
    reset.addEventListener("click", function () {
      obterCronometro(contexto).ativo = null;
      salvarEstado(contexto);
      clearInterval(intervalo);
      intervalo = null;
      renderizar();
    });
  }

  if (select) {
    select.addEventListener("change", function () {
      const ativo = cronometroAtivo(contexto);

      if (ativo) {
        finalizarCronometroAtivo(contexto);
        obterCronometro(contexto).ativo = {
          topico: select.value,
          iniciadoEm: new Date().toISOString()
        };
        salvarEstado(contexto);
      }

      renderizar();
    });
  }

  if (cronometroAtivo(contexto)) {
    ligarAtualizacao();
  }

  renderizar();
}

function iniciarQuiz(contexto) {
  const select = document.querySelector("[data-quiz-topic]");
  const form = document.querySelector("[data-quiz-form]");
  const resultado = document.querySelector("[data-quiz-result]");

  function renderizarPerguntas() {
    const topico = select.value;
    const perguntas = AREA_QUIZ[topico] || [];
    form.innerHTML = perguntas.map(function (item, indice) {
      return `
        <fieldset class="quiz-question">
          <legend>${indice + 1}. ${item.pergunta}</legend>
          ${item.opcoes.map(function (opcao, opcaoIndice) {
            return `<label><input type="radio" name="q${indice}" value="${opcaoIndice}" required> ${opcao}</label>`;
          }).join("")}
        </fieldset>`;
    }).join("") + '<button class="button primary full" type="submit">Corrigir quiz</button>';

    const salvo = contexto.estado.quiz[topico];
    if (resultado) {
      resultado.textContent = salvo ? "Melhor nota neste tópico: " + salvo.melhor + "%" : "Responda para salvar sua melhor nota localmente.";
    }
  }

  if (select) select.addEventListener("change", renderizarPerguntas);

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const topico = select.value;
      const perguntas = AREA_QUIZ[topico] || [];
      let acertos = 0;

      perguntas.forEach(function (item, indice) {
        const marcada = form.querySelector(`input[name="q${indice}"]:checked`);
        if (marcada && Number(marcada.value) === item.resposta) acertos++;
      });

      const nota = Math.round((acertos / perguntas.length) * 100);
      const anterior = contexto.estado.quiz[topico]?.melhor || 0;
      contexto.estado.quiz[topico] = { melhor: Math.max(anterior, nota), ultima: nota, atualizadoEm: new Date().toISOString() };
      salvarEstado(contexto);

      if (resultado) {
        resultado.textContent = "Você acertou " + acertos + " de " + perguntas.length + ". Nota: " + nota + "%.";
      }
    });
  }

  renderizarPerguntas();
}

function iniciarAnotacoes(contexto) {
  const select = document.querySelector("[data-note-topic]");
  const texto = document.querySelector("[data-note-text]");
  const salvar = document.querySelector("[data-note-save]");
  const limpar = document.querySelector("[data-note-clear]");
  const status = document.querySelector("[data-note-status]");

  function carregarNota() {
    if (texto && select) texto.value = contexto.estado.anotacoes[select.value] || "";
    if (status) status.textContent = "Anotação carregada.";
  }

  if (select) select.addEventListener("change", carregarNota);
  if (salvar) {
    salvar.addEventListener("click", function () {
      contexto.estado.anotacoes[select.value] = texto.value.trim();
      salvarEstado(contexto);
      if (status) status.textContent = "Anotação salva no navegador.";
    });
  }
  if (limpar) {
    limpar.addEventListener("click", function () {
      texto.value = "";
      contexto.estado.anotacoes[select.value] = "";
      salvarEstado(contexto);
      if (status) status.textContent = "Anotação apagada.";
    });
  }

  carregarNota();
}

function iniciarRevisao(contexto) {
  const lista = document.querySelector("[data-challenge-list]");
  if (!lista) return;

  lista.innerHTML = AREA_DESAFIOS.map(function (item) {
    const feita = contexto.estado.desafios[item.id];
    return `<label class="challenge-item ${feita ? "done" : ""}"><input type="checkbox" data-challenge="${item.id}" ${feita ? "checked" : ""}> ${item.texto}</label>`;
  }).join("");

  lista.querySelectorAll("[data-challenge]").forEach(function (input) {
    input.addEventListener("change", function () {
      contexto.estado.desafios[input.dataset.challenge] = input.checked;
      salvarEstado(contexto);
      iniciarRevisao(contexto);
    });
  });
}
