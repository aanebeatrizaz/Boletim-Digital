/* =========================================================
   CONFIGURAÇÃO FIXA DO ALUNO
   Turma e número de chamada ficam fixos neste projeto.
   Não podem ser alterados pela página.
   ========================================================= */
const CONFIG_ALUNO = {
  turma: "8C",
  numeroChamada: 1,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* =========================================================
   DADOS REAIS — 8º ANO
   - array: uma lista de coisas (aqui, uma lista de disciplinas)
   - objeto: um conjunto de informações com nomes (disciplina, tri1...)
   - As notas estão no formato "bruto" e serão normalizadas para 0–10.
   - O 3º Tri ainda não foi lançado (null).
   - As faltas do 3º Tri ainda não foram lançadas (0).
   ========================================================= */
const dadosLocais = [
  { disciplina: "Língua Portuguesa",           tri1: "8,9", tri2: "6,0", tri3: null, faltas: [2, 2, 0] },
  { disciplina: "Matemática",                  tri1: "5,5", tri2: "7,0", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Ciências",                    tri1: "6,2", tri2: "8,3", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "História",                    tri1: "6,7", tri2: "8,1", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Geografia",                   tri1: "6,3", tri2: "7,3", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Língua Inglesa",              tri1: "9,2", tri2: "8,5", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Arte",                        tri1: "6,0", tri2: "8,0", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Educação Física",             tri1: "10,0", tri2: "7,0", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Educação Digital",            tri1: "8,0", tri2: "10,0", tri3: null, faltas: [2, 0, 0] },
  { disciplina: "Educação Financeira",         tri1: "8,7", tri2: "8,0", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Estudo Orientado",            tri1: "7,5", tri2: "8,0", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Redação e Leitura",           tri1: "7,9", tri2: "9,5", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Pensamento Lógico",           tri1: "9,4", tri2: "8,8", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,5", tri2: "6,5", tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Práticas Experimentais",      tri1: "6,0", tri2: "7,8", tri3: null, faltas: [0, 0, 0] }
];

/* Média mínima de referência */
const MEDIA_MINIMA = 6.0;

/* =========================================================
   ESTADO EM MEMÓRIA
   - dadosAtuais: dados que estão sendo exibidos/editados
   - pinSessao: PIN digitado, mantido SOMENTE em memória
   - editando: controla o modo de edição
   ========================================================= */
let dadosAtuais = [];
let pinSessao = null;
let editando = false;

/* =========================================================
   FUNÇÃO: normalizarNota
   Recebe um valor bruto e devolve a nota na escala 0–10.
   Retorna null quando a nota ainda não foi lançada.
   ========================================================= */
function normalizarNota(valor) {
  // vazio, null ou undefined = nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for texto, troca vírgula por ponto para conseguir converter
  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }

  // Se não for um número válido, trata como inválido (null)
  if (isNaN(numero)) {
    return null;
  }

  // Regras de conversão
  if (numero >= 0 && numero <= 10) {
    return numero; // já está na escala 0–10
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10; // 82 → 8,2 | 100 → 10,0
  }

  // Fora das regras = inválido
  return null;
}

/* =========================================================
   FUNÇÃO: calcularMedia
   Calcula a média usando SOMENTE as notas disponíveis.
   Nota ausente NUNCA vira zero.
   ========================================================= */
function calcularMedia(notas) {
  const validas = notas.filter((n) => n !== null);
  if (validas.length === 0) {
    return null; // nenhuma nota disponível
  }
  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

/* =========================================================
   FUNÇÃO: definirSituacao
   Retorna a situação da disciplina conforme a média.
   ========================================================= */
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

/* =========================================================
   FUNÇÃO: formatarNota
   Mostra a nota com uma casa decimal ou "—" se não houver.
   ========================================================= */
function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

/* =========================================================
   FUNÇÃO: somarFaltas
   Soma os valores de um array de faltas.
   ========================================================= */
function somarFaltas(faltas) {
  return faltas.reduce((acc, f) => acc + f, 0);
}

/* =========================================================
   FUNÇÃO: classeSituacao
   Devolve a classe CSS correspondente à situação.
   ========================================================= */
function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

/* =========================================================
   FUNÇÃO: normalizarDados
   Recebe uma lista de disciplinas (local ou da API) e devolve
   uma lista padronizada com notas já normalizadas.
   Formato esperado de cada item:
   { disciplina, tri1, tri2, tri3, faltas: [f1, f2, f3] }
   ========================================================= */
function normalizarDados(lista) {
  return lista.map((item) => {
    const faltas = Array.isArray(item.faltas)
      ? [item.faltas[0] || 0, item.faltas[1] || 0, item.faltas[2] || 0]
      : [0, 0, 0];
    return {
      disciplina: String(item.disciplina || ""),
      tri1: normalizarNota(item.tri1),
      tri2: normalizarNota(item.tri2),
      tri3: normalizarNota(item.tri3),
      faltas: faltas.map((f) => (Number.isInteger(f) && f >= 0 ? f : 0))
    };
  });
}

/* =========================================================
   FUNÇÃO: renderizarBoletim
   Reconstrói cards e tabela a partir de dadosAtuais.
   Limpa antes de reconstruir para permitir atualizações.
   ========================================================= */
function renderizarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  if (!corpoTabela) return;

  // Limpa a tabela antes de reconstruir (evita duplicação)
  corpoTabela.innerHTML = "";

  // Array que vai guardar os resultados calculados de cada disciplina
  const resultados = [];

  dadosAtuais.forEach((item, indice) => {
    const n1 = item.tri1;
    const n2 = item.tri2;
    const n3 = item.tri3;

    // Calcula a média e a soma de faltas
    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(item.faltas);
    const situacao = definirSituacao(media);

    // Guarda o resultado para usar nos cards depois
    resultados.push({
      disciplina: item.disciplina,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    });

    // Cria a linha da tabela
    const linha = document.createElement("tr");
    linha.dataset.indice = indice;

    // Célula do nome da disciplina (nunca editável)
    const tdDisciplina = document.createElement("td");
    tdDisciplina.textContent = item.disciplina;
    linha.appendChild(tdDisciplina);

    // Células das notas e faltas (editáveis quando editando)
    linha.appendChild(criarCelulaNota(indice, "tri1", n1));
    linha.appendChild(criarCelulaNota(indice, "tri2", n2));
    linha.appendChild(criarCelulaNota(indice, "tri3", n3));

    // Média
    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarNota(media);
    tdMedia.appendChild(strongMedia);
    linha.appendChild(tdMedia);

    // Faltas (editáveis quando editando)
    linha.appendChild(criarCelulaFaltas(indice));

    // Situação
    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao(situacao);
    tdSituacao.textContent = situacao;
    linha.appendChild(tdSituacao);

    corpoTabela.appendChild(linha);
  });

  // Cards de resumo
  const mediasDisponiveis = resultados
    .map((r) => r.media)
    .filter((m) => m !== null);

  let mediaGeral = null;
  if (mediasDisponiveis.length > 0) {
    const soma = mediasDisponiveis.reduce((acc, m) => acc + m, 0);
    mediaGeral = soma / mediasDisponiveis.length;
  }

  document.getElementById("media-geral").textContent =
    mediaGeral === null ? "—" : mediaGeral.toFixed(1).replace(".", ",");

  const totalFaltasGeral = resultados.reduce((acc, r) => acc + r.faltas, 0);
  document.getElementById("total-faltas").textContent = totalFaltasGeral;

  const qtdBom = resultados.filter((r) => r.situacao === "Bom desempenho").length;
  document.getElementById("qtd-bom").textContent = qtdBom;

  const qtdAtencao = resultados.filter((r) => r.situacao === "Atenção").length;
  document.getElementById("qtd-atencao").textContent = qtdAtencao;

  // Frequência (APENAS DEMONSTRATIVA)
  document.getElementById("frequencia").textContent = "92% (Frequência adequada)";
}

/* =========================================================
   FUNÇÃO: criarCelulaNota
   Cria uma célula de nota. Se estiver editando, vira input.
   ========================================================= */
function criarCelulaNota(indice, campo, valor) {
  const td = document.createElement("td");
  if (!editando) {
    td.textContent = formatarNota(valor);
    return td;
  }
  const input = document.createElement("input");
  input.type = "text";
  input.className = "campo-edicao";
  input.dataset.indice = indice;
  input.dataset.campo = campo;
  input.inputMode = "decimal";
  input.value = valor === null ? "" : String(valor).replace(".", ",");
  td.appendChild(input);
  return td;
}

/* =========================================================
   FUNÇÃO: criarCelulaFaltas
   Cria uma célula com as 3 faltas. Se editando, vira 3 inputs.
   ========================================================= */
function criarCelulaFaltas(indice) {
  const td = document.createElement("td");
  const faltas = dadosAtuais[indice].faltas;
  if (!editando) {
    td.textContent = somarFaltas(faltas);
    return td;
  }
  for (let t = 0; t < 3; t++) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "campo-edicao";
    input.dataset.indice = indice;
    input.dataset.campo = "falta" + t;
    input.inputMode = "numeric";
    input.value = String(faltas[t]);
    input.style.width = "44px";
    input.style.marginRight = t < 2 ? "4px" : "0";
    td.appendChild(input);
  }
  return td;
}

/* =========================================================
   VALIDAÇÃO DOS CAMPOS DE EDIÇÃO
   Nota: aceita 0–10, ponto/vírgula decimal, vazio = null.
   Falta: inteiro >= 0, não vazio.
   ========================================================= */
function validarNotaEditada(texto) {
  const t = String(texto).trim();
  if (t === "") return { ok: true, valor: null };
  // Só aceita formato 7, 7.5, 7,5, 10, 0
  if (!/^\d{1,2}([.,]\d{1,2})?$/.test(t)) {
    return { ok: false };
  }
  const num = parseFloat(t.replace(",", "."));
  if (isNaN(num) || num < 0 || num > 10) {
    return { ok: false };
  }
  return { ok: true, valor: num };
}

function validarFaltaEditada(texto) {
  const t = String(texto).trim();
  if (t === "") return { ok: false };
  if (!/^\d+$/.test(t)) return { ok: false };
  const num = parseInt(t, 10);
  if (isNaN(num) || num < 0) return { ok: false };
  return { ok: true, valor: num };
}

/* =========================================================
   FUNÇÃO: coletarDadosEditados
   Lê todos os inputs da tabela. Se algum for inválido,
   marca o campo e retorna null.
   ========================================================= */
function coletarDadosEditados() {
  const inputs = document.querySelectorAll(".campo-edicao");
  let tudoValido = true;

  inputs.forEach((input) => {
    input.classList.remove("invalido");
    const erroAnterior = input.parentElement.querySelector(".erro-campo");
    if (erroAnterior) erroAnterior.remove();
  });

  inputs.forEach((input) => {
    const indice = parseInt(input.dataset.indice, 10);
    const campo = input.dataset.campo;

    if (campo === "tri1" || campo === "tri2" || campo === "tri3") {
      const res = validarNotaEditada(input.value);
      if (!res.ok) {
        tudoValido = false;
        marcarInvalido(input, "Nota inválida (0 a 10)");
      } else {
        dadosAtuais[indice][campo] = res.valor;
      }
    } else if (campo.startsWith("falta")) {
      const t = parseInt(campo.replace("falta", ""), 10);
      const res = validarFaltaEditada(input.value);
      if (!res.ok) {
        tudoValido = false;
        marcarInvalido(input, "Falta inválida (inteiro ≥ 0)");
      } else {
        dadosAtuais[indice].faltas[t] = res.valor;
      }
    }
  });

  return tudoValido;
}

function marcarInvalido(input, mensagem) {
  input.classList.add("invalido");
  const span = document.createElement("span");
  span.className = "erro-campo";
  span.textContent = mensagem;
  input.parentElement.appendChild(span);
}

/* =========================================================
   ACESSO POR PIN
   ========================================================= */
const acessoSection = document.getElementById("acesso");
const conteudoBoletim = document.getElementById("conteudo-boletim");
const campoPin = document.getElementById("campo-pin");
const btnEntrar = document.getElementById("btn-entrar");
const acessoStatus = document.getElementById("acesso-status");

async function entrar() {
  const pin = campoPin.value.trim();
  if (pin === "") {
    acessoStatus.textContent = "Digite o PIN.";
    return;
  }

  acessoStatus.style.color = "#555555";
  acessoStatus.textContent = "Conectando...";
  btnEntrar.disabled = true;

  try {
    const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pin
      })
    });

    if (resposta.status === 401) {
      acessoStatus.style.color = "#c62828";
      acessoStatus.textContent = "Turma, chamada ou PIN inválidos.";
      btnEntrar.disabled = false;
      return;
    }
    if (resposta.status === 429) {
      acessoStatus.style.color = "#c62828";
      acessoStatus.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      btnEntrar.disabled = false;
      return;
    }
    if (!resposta.ok) {
      acessoStatus.style.color = "#c62828";
      acessoStatus.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      btnEntrar.disabled = false;
      return;
    }

    const json = await resposta.json();

    // PIN permanece somente em memória durante a sessão
    pinSessao = pin;

    // Limpa o campo do PIN após login bem-sucedido
    campoPin.value = "";

    // Decide a fonte dos dados: API > local
    if (json && json.dados && Array.isArray(json.dados.disciplinas) && json.dados.disciplinas.length > 0) {
      dadosAtuais = normalizarDados(json.dados.disciplinas);
    } else {
      // Sem dados salvos: usa os dados fictícios locais
      dadosAtuais = normalizarDados(dadosLocais);
    }

    // Mostra o boletim e esconde a área de acesso
    acessoSection.hidden = true;
    conteudoBoletim.hidden = false;
    editando = false;
    document.getElementById("btn-alterar").hidden = false;
    document.getElementById("btn-salvar").hidden = true;
    document.getElementById("status-salvar").textContent = "";

    renderizarBoletim();
    btnEntrar.disabled = false;
  } catch (erro) {
    acessoStatus.style.color = "#c62828";
    acessoStatus.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    btnEntrar.disabled = false;
  }
}

btnEntrar.addEventListener("click", entrar);
campoPin.addEventListener("keydown", (e) => {
  if (e.key === "Enter") entrar();
});

/* =========================================================
   EDIÇÃO
   ========================================================= */
const btnAlterar = document.getElementById("btn-alterar");
const btnSalvar = document.getElementById("btn-salvar");
const statusSalvar = document.getElementById("status-salvar");

btnAlterar.addEventListener("click", () => {
  editando = true;
  btnAlterar.hidden = true;
  btnSalvar.hidden = false;
  statusSalvar.textContent = "";
  renderizarBoletim();
});

btnSalvar.addEventListener("click", async () => {
  statusSalvar.style.color = "#555555";
  statusSalvar.textContent = "Salvando...";
  btnSalvar.disabled = true;

  const valido = coletarDadosEditados();
  if (!valido) {
    statusSalvar.style.color = "#c62828";
    statusSalvar.textContent = "Corrija os campos inválidos antes de salvar.";
    btnSalvar.disabled = false;
    return;
  }

  try {
    const resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: dadosAtuais.map((d) => ({
            disciplina: d.disciplina,
            tri1: d.tri1,
            tri2: d.tri2,
            tri3: d.tri3,
            faltas: d.faltas
          }))
        }
      })
    });

    if (!resposta.ok) {
      statusSalvar.style.color = "#c62828";
      statusSalvar.textContent = "Não foi possível salvar. Tente novamente.";
      btnSalvar.disabled = false;
      return;
    }

    statusSalvar.style.color = "#2e7d32";
    statusSalvar.textContent = "Dados salvos com sucesso.";

    // Sai do modo de edição
    editando = false;
    btnSalvar.hidden = true;
    btnAlterar.hidden = false;
    btnSalvar.disabled = false;

    // Atualiza tabela, cards, médias, faltas e situações
    renderizarBoletim();
  } catch (erro) {
    statusSalvar.style.color = "#c62828";
    statusSalvar.textContent = "Não foi possível salvar. Tente novamente.";
    btnSalvar.disabled = false;
  }
});

