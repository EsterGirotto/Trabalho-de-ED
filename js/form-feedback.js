document.addEventListener("DOMContentLoaded", function () {
  const mensagem = document.querySelector("[data-form-message]");

  if (!mensagem) {
    return;
  }

  const parametros = new URLSearchParams(window.location.search);
  const erro = parametros.get("erro");
  const logout = parametros.get("logout");
  const acesso = parametros.get("acesso");
  const next = parametros.get("next");
  const campoNext = document.querySelector('input[name="next"]');

  if (campoNext && next) {
    campoNext.value = next;
  }

  const textos = {
    campos: "Preencha todos os campos obrigatórios.",
    email: "Informe um e-mail válido.",
    termo: "Selecione um termo válido.",
    "senha-curta": "A senha precisa ter pelo menos 6 caracteres.",
    "senha-diferente": "As senhas digitadas não são iguais.",
    duplicado: "RA ou e-mail já cadastrado.",
    login: "E-mail ou senha incorretos.",
    servidor: "Não foi possível concluir agora. Tente novamente."
  };

  if (erro && textos[erro]) {
    mensagem.textContent = textos[erro];
    mensagem.classList.add("show", "error");
    return;
  }

  if (acesso === "restrito") {
    mensagem.textContent = "Entre com sua conta para acessar essa página.";
    mensagem.classList.add("show", "error");
    return;
  }

  if (logout === "sucesso") {
    mensagem.textContent = "Você saiu do ambiente com segurança.";
    mensagem.classList.add("show", "success");
  }
});
