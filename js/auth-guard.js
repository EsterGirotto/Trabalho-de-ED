document.addEventListener("DOMContentLoaded", async function () {
  if (document.body.dataset.requireAuth !== "true") {
    return;
  }

  try {
    const status = await buscarStatus();

    if (!status.autenticado) {
      const pagina = window.location.pathname.split("/").pop() || "index.html";
      window.location.replace("login.html?acesso=restrito&next=" + encodeURIComponent(pagina));
      return;
    }

    document.body.classList.remove("auth-checking");
  } catch (erro) {
    window.location.replace("login.html?acesso=restrito");
  }
});
