document.addEventListener("DOMContentLoaded", function () {
  carregarPerfil();
  prepararMensagensDoPerfil();
  prepararPreviewDaFoto();
});

async function carregarPerfil() {
  try {
    const status = await buscarStatus();

    if (!status.autenticado) {
      return;
    }

    const usuario = status.usuario;
    preencherCampo("perfilNome", usuario.nome);
    preencherCampo("perfilRa", usuario.ra);
    preencherCampo("perfilEmail", usuario.email);
    preencherCampo("perfilTermo", String(usuario.termo || ""));

    document.querySelectorAll("[data-profile-name]").forEach(function (item) {
      item.textContent = usuario.nome;
    });

    document.querySelectorAll("[data-profile-email]").forEach(function (item) {
      item.textContent = usuario.email;
    });

    const iniciais = gerarIniciais(usuario.nome);
    document.querySelectorAll("[data-profile-initials]").forEach(function (item) {
      item.textContent = iniciais;
    });

    const imagem = document.querySelector("[data-profile-photo]");
    const iniciaisBox = document.querySelector("[data-profile-initials-box]");
    const botaoRemover = document.querySelector("[data-remove-photo]");

    if (usuario.foto_perfil && imagem) {
      imagem.src = "../" + usuario.foto_perfil + "?v=" + Date.now();
      imagem.hidden = false;
      if (iniciaisBox) {
        iniciaisBox.hidden = true;
      }
      if (botaoRemover) {
        botaoRemover.hidden = false;
      }
    }
  } catch (erro) {
    console.warn("Nao foi possivel carregar o perfil.", erro);
  }
}

function preencherCampo(id, valor) {
  const campo = document.getElementById(id);

  if (campo) {
    campo.value = valor || "";
  }
}

function gerarIniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(function (parte) {
      return parte.charAt(0).toUpperCase();
    })
    .join("") || "ED";
}

function prepararMensagensDoPerfil() {
  const mensagem = document.querySelector("[data-profile-message]");

  if (!mensagem) {
    return;
  }

  const parametros = new URLSearchParams(window.location.search);
  const erro = parametros.get("erro");
  const sucesso = parametros.get("sucesso");

  const erros = {
    campos: "Preencha todos os campos obrigatórios.",
    email: "Informe um e-mail válido.",
    termo: "Selecione um termo válido.",
    duplicado: "RA ou e-mail já está em uso.",
    "senha-curta": "A nova senha precisa ter pelo menos 6 caracteres.",
    "senha-diferente": "A confirmação não bate com a nova senha.",
    "senha-atual": "A senha atual está incorreta.",
    foto: "Não foi possível enviar a foto.",
    "foto-tamanho": "A foto deve ter até 2 MB.",
    "foto-tipo": "Use uma foto JPG, PNG ou WEBP.",
    servidor: "Não foi possível salvar agora. Tente novamente."
  };

  const sucessos = {
    dados: "Dados do perfil atualizados.",
    senha: "Senha alterada com sucesso.",
    foto: "Foto de perfil atualizada.",
    "foto-removida": "Foto de perfil removida."
  };

  if (erro && erros[erro]) {
    mensagem.textContent = erros[erro];
    mensagem.classList.add("show", "error");
    return;
  }

  if (sucesso && sucessos[sucesso]) {
    mensagem.textContent = sucessos[sucesso];
    mensagem.classList.add("show", "success");
  }
}

function prepararPreviewDaFoto() {
  const input = document.getElementById("foto");
  const imagem = document.querySelector("[data-profile-photo]");
  const iniciaisBox = document.querySelector("[data-profile-initials-box]");

  if (!input || !imagem) {
    return;
  }

  input.addEventListener("change", function () {
    const arquivo = input.files && input.files[0];

    if (!arquivo) {
      return;
    }

    imagem.src = URL.createObjectURL(arquivo);
    imagem.hidden = false;

    if (iniciaisBox) {
      iniciaisBox.hidden = true;
    }
  });
}
