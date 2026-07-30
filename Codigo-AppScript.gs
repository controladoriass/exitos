/**
 * Silva & Silva — Cadastro de Êxitos
 * Recebe o POST do formulário (index.html), grava uma linha na planilha
 * e, se houver anexos, cria uma pasta por processo no Drive e salva os arquivos.
 *
 * Planilha de destino:
 * https://docs.google.com/spreadsheets/d/1pRvYAFNb62663B6rL_MHX-sI2VlRL4itYdupgqCUrhI/edit
 *
 * >>> Ver INSTRUCOES.md para publicar como Web App e pegar a URL. <<<
 */

// Nome da aba onde os êxitos serão gravados (será criada se não existir).
var ABA = "Êxitos";

// Pasta-mãe no Google Drive onde as pastas de cada processo serão criadas.
// (ID da pasta compartilhada pelo usuário)
var PASTA_MAE_ID = "1Knr8WtQjYmCCCVCgf6Se_oZip9354uRY";

// Cabeçalho da planilha (ordem das colunas).
var CABECALHO = [
  "Data/Hora",
  "Tipo de Receita",
  "Nº do Processo",
  "Cliente",
  "Valor a Faturar (R$)",
  "Cidade",
  "Área Jurídica",
  "Centro de Receita",
  "Anexos",
  "Observações"
];

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var aba = pegarAba_();

    // Se vierem anexos, cria/reaproveita a pasta do processo e salva os arquivos.
    var linkAnexos = "";
    if (dados.anexos && dados.anexos.length > 0) {
      linkAnexos = salvarAnexos_(dados);
    }

    aba.appendRow([
      dados.dataHora    || new Date().toLocaleString("pt-BR"),
      dados.tipo        || "",
      dados.processo    || "",
      dados.cliente     || "",
      dados.valor       || 0,
      dados.cidade        || "",
      dados.area          || "",
      dados.centroReceita || "",
      linkAnexos,
      dados.observacoes   || ""
    ]);

    return json_({ ok: true, anexos: linkAnexos });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  }
}

// Permite testar a URL no navegador (GET) — deve mostrar "online".
function doGet() {
  return json_({ ok: true, status: "online", aba: ABA });
}

/**
 * Cria (ou reaproveita) uma pasta "Nº Processo — Cliente" dentro da pasta-mãe,
 * salva todos os anexos e devolve a URL da pasta.
 */
function salvarAnexos_(dados) {
  var mae = DriveApp.getFolderById(PASTA_MAE_ID);

  // Nome da pasta do processo — limpo de caracteres inválidos.
  var proc = (dados.processo || "sem-processo").toString().trim();
  var cliente = (dados.cliente || "").toString().trim();
  var nomePasta = (proc + (cliente ? " — " + cliente : "")).replace(/[\\\/:*?"<>|]/g, "-");

  // Reaproveita a pasta se já existir; senão cria.
  var pasta;
  var existentes = mae.getFoldersByName(nomePasta);
  if (existentes.hasNext()) {
    pasta = existentes.next();
  } else {
    pasta = mae.createFolder(nomePasta);
  }

  // Salva cada arquivo (base64 → blob).
  dados.anexos.forEach(function (a) {
    var bytes = Utilities.base64Decode(a.dados);
    var blob = Utilities.newBlob(bytes, a.tipo || "application/octet-stream", a.nome || "arquivo");
    pasta.createFile(blob);
  });

  return pasta.getUrl();
}

function pegarAba_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA);
  if (!aba) {
    aba = ss.insertSheet(ABA);
  }
  // Garante o cabeçalho na primeira linha.
  if (aba.getLastRow() === 0) {
    aba.appendRow(CABECALHO);
    aba.getRange(1, 1, 1, CABECALHO.length)
       .setFontWeight("bold")
       .setBackground("#1E223F")
       .setFontColor("#CFA36E");
    aba.setFrozenRows(1);
    // Formata a coluna de valor como moeda.
    aba.getRange(2, 5, aba.getMaxRows(), 1).setNumberFormat('R$ #,##0.00');
  }
  return aba;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
