/**
 * Silva & Silva — Cadastro de Êxitos
 * Recebe o POST do formulário (index.html) e grava uma linha na planilha.
 *
 * Planilha de destino:
 * https://docs.google.com/spreadsheets/d/1pRvYAFNb62663B6rL_MHX-sI2VlRL4itYdupgqCUrhI/edit
 *
 * >>> Ver INSTRUCOES.md para publicar como Web App e pegar a URL. <<<
 */

// Nome da aba onde os êxitos serão gravados (será criada se não existir).
var ABA = "Êxitos";

// Cabeçalho da planilha (ordem das colunas).
var CABECALHO = [
  "Data/Hora",
  "Tipo",
  "Nº do Processo",
  "Cliente",
  "Valor (R$)",
  "Cidade",
  "Área Jurídica",
  "Centro de Receita",
  "Observações"
];

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var aba = pegarAba_();

    aba.appendRow([
      dados.dataHora    || new Date().toLocaleString("pt-BR"),
      dados.tipo        || "",
      dados.processo    || "",
      dados.cliente     || "",
      dados.valor       || 0,
      dados.cidade        || "",
      dados.area          || "",
      dados.centroReceita || "",
      dados.observacoes   || ""
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  }
}

// Permite testar a URL no navegador (GET) — deve mostrar "online".
function doGet() {
  return json_({ ok: true, status: "online", aba: ABA });
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
