(function () {
  const PAGINA_APOS_LOGIN = "biblioteca.html"; // tela da funcionalidade principal
  const CAMPOS = ["email", "senha"];

  if (Sessao.ativa()) { window.location.replace(PAGINA_APOS_LOGIN); return; }

  Form.ativarVerSenha();

  if (new URLSearchParams(window.location.search).get("cadastro") === "ok") {
    Form.mostrarAviso("sucesso", "Conta criada. Entre para continuar.");
  }

  function validar(email, senha) {
    let valido = true;
    if (!email) { Form.mostrarErroCampo("email", "Informe o seu e-mail."); valido = false; }
    else if (!Form.EMAIL_REGEX.test(email)) { Form.mostrarErroCampo("email", "Digite um e-mail válido, como nome@exemplo.com."); valido = false; }
    if (!senha) { Form.mostrarErroCampo("senha", "Informe a sua senha."); valido = false; }
    return valido;
  }

  document.getElementById("form-login").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    Form.limparErros(CAMPOS);

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!validar(email, senha)) {
      const primeiro = document.querySelector('[aria-invalid="true"]');
      if (primeiro) primeiro.focus();
      return;
    }

    const botao = document.getElementById("btn-enviar");
    botao.disabled = true;
    botao.textContent = "Entrando…";

    const resp = await Api.entrar(email, senha);

    if (resp.ok && resp.dados && resp.dados.token) {
      Sessao.salvar(resp.dados.token, resp.dados.usuario);
      window.location.assign(PAGINA_APOS_LOGIN);
      return;
    }

    botao.disabled = false;
    botao.textContent = "Entrar";
    const msg = resp.status === 401
      ? "E-mail ou senha incorretos. Confira os dados e tente de novo."
      : (resp.dados && resp.dados.erro) || "Não foi possível entrar agora. Tente novamente.";
    Form.mostrarAviso("erro", msg);
  });
})();