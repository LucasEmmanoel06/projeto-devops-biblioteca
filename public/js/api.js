// Utilitários compartilhados: chamadas à API, sessão e helpers de formulário.
// Qualquer tela nova (ex.: biblioteca.html) pode reutilizar este arquivo.
(function () {
  const CHAVE_TOKEN = "biblioteca_token";
  const CHAVE_USUARIO = "biblioteca_usuario";

  const Sessao = {
    salvar(token, usuario) {
      localStorage.setItem(CHAVE_TOKEN, token);
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario || {}));
    },
    token() { return localStorage.getItem(CHAVE_TOKEN); },
    usuario() {
      try { return JSON.parse(localStorage.getItem(CHAVE_USUARIO)) || null; }
      catch (_) { return null; }
    },
    ativa() { return Boolean(localStorage.getItem(CHAVE_TOKEN)); },
    encerrar() {
      localStorage.removeItem(CHAVE_TOKEN);
      localStorage.removeItem(CHAVE_USUARIO);
    }
  };

  // Envia JSON e devolve { ok, status, dados }. Nunca lança erro de rede.
  async function requisitar(caminho, { metodo = "GET", corpo, autenticado = false } = {}) {
    const cabecalhos = { "Accept": "application/json" };
    if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
    if (autenticado && Sessao.token()) cabecalhos["Authorization"] = "Bearer " + Sessao.token();

    try {
      const resp = await fetch(window.APP_CONFIG.API_BASE + caminho, {
        method: metodo,
        headers: cabecalhos,
        body: corpo !== undefined ? JSON.stringify(corpo) : undefined
      });
      let dados = null;
      try { dados = await resp.json(); } catch (_) { /* resposta sem corpo */ }
      return { ok: resp.ok, status: resp.status, dados };
    } catch (_) {
      return {
        ok: false, status: 0,
        dados: { erro: "Não foi possível conectar ao servidor. Tente novamente em instantes." }
      };
    }
  }

  const Api = {
    cadastrar: (nome, email, senha) =>
      requisitar("/api/auth/cadastro", { metodo: "POST", corpo: { nome, email, senha } }),
    entrar: (email, senha) =>
      requisitar("/api/auth/login", { metodo: "POST", corpo: { email, senha } }),
    requisitar
  };

  // ---- Helpers de formulário ----
  function mostrarErroCampo(id, mensagem) {
    const campo = document.getElementById(id);
    const erro = document.getElementById("erro-" + id);
    if (!campo || !erro) return;
    erro.textContent = mensagem || "";
    if (mensagem) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
  }

  function limparErros(ids) { ids.forEach(id => mostrarErroCampo(id, "")); }

  function mostrarAviso(tipo, mensagem) {
    const aviso = document.getElementById("aviso");
    aviso.className = "aviso " + tipo; // "erro" ou "sucesso"
    aviso.textContent = mensagem;      // textContent evita injeção de HTML
    aviso.hidden = false;
  }

  function esconderAviso() { document.getElementById("aviso").hidden = true; }

  function ativarVerSenha() {
    document.querySelectorAll(".ver-senha").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.alvo);
        const mostrando = input.type === "text";
        input.type = mostrando ? "password" : "text";
        btn.textContent = mostrando ? "Mostrar" : "Ocultar";
      });
    });
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  window.Sessao = Sessao;
  window.Api = Api;
  window.Form = { mostrarErroCampo, limparErros, mostrarAviso, esconderAviso, ativarVerSenha, EMAIL_REGEX };
})();