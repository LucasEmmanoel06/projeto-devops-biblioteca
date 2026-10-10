(function () {
  const CAMPOS = ["titulo", "autor", "ano"];
  const CORES = ["#2f5d62", "#7a2e3b", "#d8c9a3", "#4a5a7a", "#b9791a"];

  let livros = [];
  let termo = "";
  let carregamento = 0;

  const lista = document.getElementById("lista");
  const vazio = document.getElementById("vazio");
  const contador = document.getElementById("contador");

  function renderizar() {
    lista.replaceChildren(...livros.map(criarItem));

    contador.textContent = livros.length === 0 ? "" :
      livros.length + (livros.length === 1 ? " livro" : " livros");

    if (livros.length === 0) {
      vazio.textContent = termo
        ? "Nenhum livro encontrado. Tente outro título ou autor."
        : "Sua estante está vazia. Adicione o primeiro livro acima.";
      vazio.hidden = false;
    } else {
      vazio.hidden = true;
    }
  }

  function criarItem(livro) {
    const li = document.createElement("li");
    li.className = "livro";
    li.style.setProperty("--cor", CORES[livro.id % CORES.length]);

    const info = document.createElement("div");
    info.className = "livro-info";

    const titulo = document.createElement("h3");
    titulo.className = "livro-titulo";
    titulo.textContent = livro.titulo; // textContent evita injeção de HTML

    const meta = document.createElement("p");
    meta.className = "livro-meta";
    meta.textContent = livro.autor + (livro.ano ? " · " + livro.ano : "");

    info.append(titulo, meta);

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-excluir";
    botao.textContent = "Excluir";
    botao.setAttribute("aria-label", "Excluir o livro " + livro.titulo);
    botao.addEventListener("click", () => excluir(livro.id));

    li.append(info, botao);
    return li;
  }

  function validar({ titulo, autor, ano }) {
    let valido = true;
    if (!titulo) { Form.mostrarErroCampo("titulo", "Informe o título do livro."); valido = false; }
    if (!autor) { Form.mostrarErroCampo("autor", "Informe o autor do livro."); valido = false; }
    if (ano !== "") {
      const n = Number(ano);
      if (!Number.isInteger(n) || n < 1 || n > new Date().getFullYear()) {
        Form.mostrarErroCampo("ano", "Digite um ano válido, como 1999.");
        valido = false;
      }
    }
    return valido;
  }

  function lidarComSessaoExpirada(resp) {
    if (resp.status !== 401) return false;
    Sessao.encerrar();
    window.location.replace("index.html");
    return true;
  }

  async function carregarLivros() {
    const idCarregamento = ++carregamento;
    const resp = await Api.listarLivros(termo);
    if (idCarregamento !== carregamento) return;
    if (lidarComSessaoExpirada(resp)) return;

    if (!resp.ok || !Array.isArray(resp.dados)) {
      Form.mostrarAviso("erro", (resp.dados && resp.dados.erro) ||
        "Não foi possível carregar os livros. Tente novamente.");
      return;
    }

    livros = resp.dados;
    renderizar();
  }

  document.getElementById("form-livro").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    Form.limparErros(CAMPOS);
    Form.esconderAviso();

    const dados = {
      titulo: document.getElementById("titulo").value.trim(),
      autor: document.getElementById("autor").value.trim(),
      ano: document.getElementById("ano").value.trim()
    };

    if (!validar(dados)) {
      const primeiro = document.querySelector('[aria-invalid="true"]');
      if (primeiro) primeiro.focus();
      return;
    }

    const botao = ev.target.querySelector("button[type=submit]");
    botao.disabled = true;
    botao.textContent = "Adicionando…";
    const resp = await Api.criarLivro({
      titulo: dados.titulo,
      autor: dados.autor,
      ano: dados.ano === "" ? null : Number(dados.ano)
    });

    botao.disabled = false;
    botao.textContent = "Adicionar livro";
    if (lidarComSessaoExpirada(resp)) return;
    if (!resp.ok) {
      Form.mostrarAviso("erro", (resp.dados && resp.dados.erro) ||
        "Não foi possível adicionar o livro. Tente novamente.");
      return;
    }

    ev.target.reset();
    document.getElementById("titulo").focus();
    Form.mostrarAviso("sucesso", "Livro adicionado.");
    await carregarLivros();
  });

  document.getElementById("busca").addEventListener("input", (ev) => {
    termo = ev.target.value.trim();
    carregarLivros();
  });

  async function excluir(id) {
    const livro = livros.find(l => l.id === id);
    if (!livro || !window.confirm("Excluir \"" + livro.titulo + "\"?")) return;

    const resp = await Api.excluirLivro(id);
    if (lidarComSessaoExpirada(resp)) return;
    if (!resp.ok) {
      Form.mostrarAviso("erro", (resp.dados && resp.dados.erro) ||
        "Não foi possível excluir o livro. Tente novamente.");
      return;
    }

    Form.mostrarAviso("sucesso", "Livro excluído.");
    await carregarLivros();
  }

  document.querySelector('.troca a').addEventListener("click", () => Sessao.encerrar());

  if (!Sessao.ativa()) {
    window.location.replace("index.html");
    return;
  }

  carregarLivros();
})();