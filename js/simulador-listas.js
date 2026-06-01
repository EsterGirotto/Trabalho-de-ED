document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-simulador]").forEach(iniciarSimulador);
});

function iniciarSimulador(simulador) {
  const tipo = simulador.dataset.simulador;
  const entrada = simulador.querySelector("[data-lista-valor]");
  const visual = simulador.querySelector("[data-lista-visual]");
  const status = simulador.querySelector("[data-lista-status]");
  const estado = {
    valores: tipo === "dupla" ? [8, 16, 32] : [10, 25, 40],
    destaque: null
  };

  function valorDigitado() {
    const valor = Number.parseInt(entrada.value, 10);

    if (Number.isNaN(valor)) {
      status.textContent = "Digite um número antes de executar a operação.";
      entrada.focus();
      return null;
    }

    return valor;
  }

  function renderizar(mensagem) {
    visual.innerHTML = "";

    if (estado.valores.length === 0) {
      visual.innerHTML = '<span class="cell null">lista vazia</span>';
    } else {
      if (tipo === "dupla") {
        visual.appendChild(criarCelula("null", true));
        visual.appendChild(criarSeta("↔"));
      }

      estado.valores.forEach(function (valor, indice) {
        visual.appendChild(criarCelula(String(valor), false, valor === estado.destaque));

        if (indice < estado.valores.length - 1) {
          visual.appendChild(criarSeta(tipo === "dupla" ? "↔" : "→"));
        }
      });

      visual.appendChild(criarSeta(tipo === "dupla" ? "↔" : "→"));
      visual.appendChild(criarCelula("null", true));
    }

    status.textContent = mensagem;
  }

  simulador.addEventListener("click", function (event) {
    const botao = event.target.closest("[data-lista-acao]");

    if (!botao) {
      return;
    }

    const acao = botao.dataset.listaAcao;
    estado.destaque = null;

    if (acao === "limpar") {
      estado.valores = [];
      renderizar("Lista limpa.");
      return;
    }

    const valor = valorDigitado();

    if (valor === null) {
      return;
    }

    if (acao === "inicio") {
      estado.valores.unshift(valor);
      renderizar(valor + " inserido no início.");
      return;
    }

    if (acao === "fim") {
      estado.valores.push(valor);
      renderizar(valor + " inserido no fim.");
      return;
    }

    if (acao === "buscar") {
      const encontrado = estado.valores.includes(valor);
      estado.destaque = encontrado ? valor : null;
      renderizar(encontrado ? valor + " encontrado na lista." : valor + " não está na lista.");
      return;
    }

    if (acao === "remover") {
      const indice = estado.valores.indexOf(valor);

      if (indice === -1) {
        renderizar(valor + " não foi encontrado para remoção.");
        return;
      }

      estado.valores.splice(indice, 1);
      renderizar(valor + " removido da lista.");
    }
  });

  renderizar("Experimente inserir, buscar ou remover um valor.");
}

function criarCelula(texto, nula, destaque) {
  const celula = document.createElement("span");
  celula.className = "cell" + (nula ? " null" : "") + (destaque ? " found" : "");
  celula.textContent = texto;
  return celula;
}

function criarSeta(texto) {
  const seta = document.createElement("span");
  seta.className = "arrow";
  seta.textContent = texto;
  return seta;
}
