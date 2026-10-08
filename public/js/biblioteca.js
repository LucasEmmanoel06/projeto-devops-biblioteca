(function () {
  const CAMPOS = ["titulo", "autor", "ano"];
  const CORES = ["#2f5d62", "#7a2e3b", "#d8c9a3", "#4a5a7a", "#b9791a"];

  // "Banco de dados" provisório: começa vazio e vive só na memória da página.
  // (Ao recarregar a página, a lista volta a ficar vazia.)
  let livros = [];
  let proximoId = 1;
  let termo = "";

  const lista = document.getElementById("lista");
  const vazio = document.getElementById("vazio");
  const contador = document.getElementById("contador");

  // ---- Mostrar a lista (já filtrada pela busca) ----
  function renderizar() {
    const t = termo.toLowerCase();
    const visiveis = livros.filter(l =>
      l.titulo.toLowerCase().includes(t) || l.autor.toLowerCase().includes(t));

    lista.replaceChildren(...visiveis.map(criarItem));

    contador.textContent = livros.length === 0 ? "" :
      (termo ? visiveis.length + " de " + livros.length : livros.length) +
      (livros.length === 1 ? " livro" : " livros");

    if (visiveis.length === 0) {
      vazio.textContent = livros.length === 0
        ? "Sua estante está vazia. Adicione o primeiro livro acima."
        : "Nenhum livro encontrado. Tente outro título ou autor.";
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

  // ---- Adicionar ----
  function validar({ titulo, autor, ano }) {
    let valido = true;
    if (!titulo) { Form.mostrarErroCampo("titulo", "Informe o título do livro."); valido = false; }
    if (!autor) { Form.mostrarErroCampo("autor", "Informe o autor do livro."); valido = false; }
    if (ano !== "") {
      const n = Number(ano);
      if (!Number.isInteger(n) || n < 1 || n > 2100) {
        Form.mostrarErroCampo("ano", "Digite um ano válido, como 1999.");
        valido = false;
      }
    }
    return valido;
  }

  document.getElementById("form-livro").addEventListener("submit", (ev) => {
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

    livros.unshift({
      id: proximoId++,
      titulo: dados.titulo,
      autor: dados.autor,
      ano: dados.ano === "" ? null : Number(dados.ano)
    });

    ev.target.reset();
    document.getElementById("titulo").focus();
    Form.mostrarAviso("sucesso", "Livro adicionado.");
    renderizar();
  });

  // ---- Buscar ----
  document.getElementById("busca").addEventListener("input", (ev) => {
    termo = ev.target.value.trim();
    renderizar();
  });

  // ---- Excluir ----
  function excluir(id) {
    const livro = livros.find(l => l.id === id);
    if (!livro || !window.confirm("Excluir \"" + livro.titulo + "\"?")) return;
    livros = livros.filter(l => l.id !== id);
    Form.mostrarAviso("sucesso", "Livro excluído.");
    renderizar();
  }

  // ---- Sair ----
  document.querySelector('.troca a').addEventListener("click", () => Sessao.encerrar());

  renderizar();
})();