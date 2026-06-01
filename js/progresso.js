document.addEventListener("DOMContentLoaded", function () {
  const slug = document.body.dataset.topico;

  if (!slug) {
    return;
  }

  montarPainelDeProgresso(slug);
});

async function montarPainelDeProgresso(slug) {
  const referencia = document.querySelector(".page-hero");

  if (!referencia) {
    return;
  }

  const painel = document.createElement("section");
  painel.className = "progress-panel";
  painel.setAttribute("aria-live", "polite");
  painel.innerHTML = `
    <div class="progress-content">
      <div>
        <p class="eyebrow">Progresso do estudo</p>
        <strong data-progress-title>Verificando seu progresso...</strong>
        <p data-progress-text>Use sua conta para registrar os tópicos concluídos.</p>
      </div>
      <div class="progress-actions" data-progress-actions></div>
    </div>
  `;

  referencia.insertAdjacentElement("afterend", painel);

  try {
    const status = await buscarStatus();
    const titulo = painel.querySelector("[data-progress-title]");
    const texto = painel.querySelector("[data-progress-text]");
    const acoes = painel.querySelector("[data-progress-actions]");

    if (!status.autenticado) {
      titulo.textContent = "Entre para salvar seu progresso";
      texto.textContent = "Depois do login, este tópico pode ficar marcado como concluído.";
      acoes.innerHTML = '<a class="button primary" href="login.html">Entrar</a>';
      return;
    }

    const progresso = status.progresso || {};
    const concluidos = Object.values(progresso).filter(function (item) {
      return item.visualizado;
    }).length;
    const total = Math.max(Object.keys(progresso).length, 1);
    const topicoAtual = progresso[slug] || { visualizado: false };

    titulo.textContent = "Olá, " + status.usuario.nome.trim().split(/\s+/)[0] + "!";
    texto.textContent = concluidos + " de " + total + " tópicos concluídos.";

    const botao = document.createElement("button");
    botao.className = "button primary progress-button";
    botao.type = "button";
    botao.textContent = topicoAtual.visualizado ? "Tópico concluído" : "Marcar como concluído";
    botao.disabled = Boolean(topicoAtual.visualizado);

    botao.addEventListener("click", async function () {
      botao.disabled = true;
      botao.textContent = "Salvando...";

      const dados = new FormData();
      dados.append("slug", slug);

      const resposta = await fetch("../php/progresso.php", {
        method: "POST",
        body: dados,
        credentials: "same-origin"
      });

      if (!resposta.ok) {
        botao.disabled = false;
        botao.textContent = "Tentar novamente";
        return;
      }

      botao.textContent = "Tópico concluído";
      texto.textContent = Math.min(concluidos + 1, total) + " de " + total + " tópicos concluídos.";
    });

    acoes.appendChild(botao);
  } catch (erro) {
    painel.querySelector("[data-progress-title]").textContent = "Progresso indisponível";
    painel.querySelector("[data-progress-text]").textContent = "Verifique se o Apache, MySQL e o banco foram iniciados.";
  }
}
