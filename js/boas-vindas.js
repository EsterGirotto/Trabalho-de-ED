const parametros = new URLSearchParams(window.location.search);
const modal = document.getElementById("boasVindasModal");
const botaoFechar = document.getElementById("fecharBoasVindas");

if (modal && botaoFechar) {
  const titulo = modal.querySelector("h2");
  const texto = modal.querySelector("p:not(.eyebrow)");
  const etiqueta = modal.querySelector(".eyebrow");

  if (parametros.get("cadastro") === "sucesso") {
    modal.classList.add("show");
  }

  if (parametros.get("login") === "sucesso") {
    etiqueta.textContent = "Login realizado";
    titulo.textContent = "Que bom te ver de volta!";
    texto.textContent = "Seu acesso foi confirmado. Continue estudando e marque seu progresso nos tópicos da plataforma.";
    modal.classList.add("show");
  }

  botaoFechar.addEventListener("click", function () {
    modal.classList.remove("show");
    window.history.replaceState({}, document.title, "index.html");
  });
}
