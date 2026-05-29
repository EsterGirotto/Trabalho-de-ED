const parametros = new URLSearchParams(window.location.search);
const modal = document.getElementById("boasVindasModal");
const botaoFechar = document.getElementById("fecharBoasVindas");

if (parametros.get("cadastro") === "sucesso") 
  {
  modal.classList.add("show");
  }

botaoFechar.addEventListener("click", function () 
  {
  modal.classList.remove("show");
  window.history.replaceState({}, document.title, "index.html");
  });
