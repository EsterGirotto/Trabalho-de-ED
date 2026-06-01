document.addEventListener("DOMContentLoaded", function () {
  atualizarStatusDoUsuario();
  registrarAcesso();
});

async function buscarStatus() {
  const resposta = await fetch("../php/status.php", {
    credentials: "same-origin"
  });

  if (!resposta.ok) {
    return { autenticado: false, usuario: null, progresso: {} };
  }

  return resposta.json();
}

async function atualizarStatusDoUsuario() {
  try {
    const status = await buscarStatus();
    const links = document.querySelectorAll(".auth-link");

    links.forEach(function (link) {
      if (!status.autenticado) {
        link.textContent = "Login";
        link.href = "login.html";
        link.classList.remove("logged");
        link.removeAttribute("title");
        return;
      }

      const primeiroNome = status.usuario.nome.trim().split(/\s+/)[0];
      link.textContent = "Perfil";
      link.href = "perfil.html";
      link.title = "Logado como " + primeiroNome;
      link.classList.add("logged");
    });
  } catch (erro) {
    console.warn("Nao foi possivel consultar a sessao.", erro);
  }
}

function registrarAcesso() {
  const dados = new FormData();
  dados.append("pagina", window.location.pathname.split("/").pop() || "index.html");

  fetch("../php/log_acesso.php", {
    method: "POST",
    body: dados,
    credentials: "same-origin",
    keepalive: true
  }).catch(function () {
    // O registro de acesso nao deve atrapalhar a navegacao.
  });
}
