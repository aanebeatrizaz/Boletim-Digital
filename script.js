/* =========================================================
   DADOS REAIS — 8º ANO
   - array: uma lista de coisas (aqui, uma lista de disciplinas)
   - objeto: um conjunto de informações com nomes (disciplina, tri1...)
   - As notas estão no formato "bruto" e serão normalizadas para 0–10.
   - O 3º Tri ainda não foi lançado (null).
   - As faltas do 3º Tri ainda não foram lançadas (0).
   ========================================================= */
const dados = [
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
   PREENCHER A TABELA
   Usamos o DOM: pegamos o <tbody> pelo id e criamos
   uma linha (<tr>) para cada disciplina usando forEach.
   ========================================================= */
const corpoTabela = document.getElementById("corpo-tabela");

// Array que vai guardar os resultados calculados de cada disciplina
const resultados = [];

dados.forEach((item) => {
  // Normaliza cada trimestre
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

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
  linha.innerHTML = `
    <td>${item.disciplina}</td>
    <td>${formatarNota(n1)}</td>
    <td>${formatarNota(n2)}</td>
    <td>${formatarNota(n3)}</td>
    <td><strong>${formatarNota(media)}</strong></td>
    <td>${totalFaltas}</td>
    <td class="${classeSituacao(situacao)}">${situacao}</td>
  `;
  corpoTabela.appendChild(linha);
});

/* =========================================================
   CARDS DE RESUMO
   ========================================================= */

// Média geral: média das médias disponíveis (ignora as sem nota)
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

// Total de faltas (soma de todas as disciplinas)
const totalFaltasGeral = resultados.reduce((acc, r) => acc + r.faltas, 0);
document.getElementById("total-faltas").textContent = totalFaltasGeral;

// Quantidade com bom desempenho
const qtdBom = resultados.filter((r) => r.situacao === "Bom desempenho").length;
document.getElementById("qtd-bom").textContent = qtdBom;

// Quantidade que precisa de atenção
const qtdAtencao = resultados.filter((r) => r.situacao === "Atenção").length;
document.getElementById("qtd-atencao").textContent = qtdAtencao;

// Frequência (APENAS DEMONSTRATIVA nesta primeira versão)
// No futuro, esse valor será calculado de outra forma.
document.getElementById("frequencia").textContent = "92% (Frequência adequada)";