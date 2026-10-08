(function () {
  const CAMPOS = ["nome", "email", "senha", "confirmar"];
  const SENHA_MIN = 8;

  if (Sessao.ativa()) { window.location.replace("biblioteca.html"); return; }

  Form.ativarVerSenha();

  function validar({ nome, email, senha, confirmar }) {
    let valido = true;
    if (nome.length < 2) { Form.mostrarErroCampo("nome", "Informe o seu nome (mínimo de 2 letras)."); valido = false; }
    if (!email) { Form.mostrarErroCampo("email", "Informe o seu e-mail."); valido = false; }
    else if (!Form.EMAIL_REGEX.test(email)) { Form.mostrarErroCampo("email", "Digite um e-mail válido, como nome@exemplo.com."); valido = false; }
    if (senha.length < SENHA_MIN) { Form.mostrarErroCampo("senha", "A senha precisa ter pelo menos " + SENHA_MIN + " caracteres."); valido = false; }
    if (confirmar !== senha) { Form.mostrarErroCampo("confirmar", "As senhas não são iguais."); valido = false; }
    return valido;
  }

  document.getElementById("form-cadastro").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    Form.limparErros(CAMPOS);
    Form.esconderAviso();

    const dados = {
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      senha: document.getElementById("senha").value,
      confirmar: document.getElementById("confirmar").value
    };

    if (!validar(dados)) {
      const primeiro = document.querySelector('[aria-invalid="true"]');
      if (primeiro) primeiro.focus();
      return;
    }

    const botao = document.getElementById("btn-enviar");
    botao.disabled = true;
    botao.textContent = "Criando conta…";

    const resp = await Api.cadastrar(dados.nome, dados.email, dados.senha);

    if (resp.ok) {
      window.location.assign("index.html?cadastro=ok");
      return;
    }

    botao.disabled = false;
    botao.textContent = "Criar conta";

    if (resp.status === 409) {
      Form.mostrarErroCampo("email", "Já existe uma conta com este e-mail. Entre ou use outro e-mail.");
      document.getElementById("email").focus();
    } else {
      Form.mostrarAviso("erro", (resp.dados && resp.dados.erro) || "Não foi possível criar a conta. Tente novamente.");
    }
  });
})();