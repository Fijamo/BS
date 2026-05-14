/**
 * ============================================================
 * services/RelatorioService.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Contém a lógica de geração do ficheiro Excel (.xlsx)
 *   usando a biblioteca ExcelJS.
 *
 *   Os Services encapsulam lógica de negócio que não é
 *   específica de HTTP (controllers) nem de base de dados
 *   (models) — como formatação, geração de ficheiros,
 *   envio de emails, cálculos, etc.
 * ============================================================
 */

// ExcelJS: biblioteca para criar e manipular ficheiros Excel
const ExcelJS = require('exceljs');

/**
 * gerarExcel(dados, res)
 * -----------------------
 * Recebe um array de clientes e escreve um ficheiro .xlsx
 * diretamente no stream de resposta HTTP, forçando o download
 * no browser do utilizador.
 *
 * @param {Array}    dados - array de objetos cliente do banco de dados
 * @param {Object}   res   - objeto response do Express (stream HTTP)
 * @returns {Promise<void>}
 */
async function gerarExcel(dados, res) {

  // Cria um novo workbook (pasta de trabalho Excel)
  const workbook = new ExcelJS.Workbook();

  // Adiciona uma folha (sheet) chamada 'Clientes'
  const worksheet = workbook.addWorksheet('Clientes');

  /**
   * Define as colunas da folha Excel.
   * Cada objeto tem:
   *   header → texto visível no cabeçalho da coluna (linha 1)
   *   key    → nome da propriedade no objeto cliente (do banco)
   *   width  → largura da coluna em caracteres
   */
  worksheet.columns = [
    { header: 'Nome',        key: 'nome',          width: 25 },
    { header: 'Apelido',     key: 'apelido',        width: 20 },
    { header: 'Apólice',     key: 'apolice',        width: 20 },
    { header: 'Ramo',        key: 'ramo',           width: 20 },
    { header: 'Seguradora',  key: 'seguradora',     width: 20 },
    { header: 'Estado',      key: 'estado_apolice', width: 15 },
    { header: 'Data Início', key: 'data_inicio',    width: 20 },
    { header: 'Data Fim',    key: 'data_fim',       width: 20 },
    { header: 'Contacto',    key: 'contacto_principal', width: 20 },
    { header: 'Endereço',    key: 'endereco',       width: 30 }
  ];

  /**
   * Estilo do cabeçalho — linha 1 fica a negrito e com fundo azul escuro
   * getRow(1) acede à primeira linha (os headers definidos acima)
   */
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type    : 'pattern',
    pattern : 'solid',
    fgColor : { argb: 'FF1F3A6E' }  // azul escuro (cor do tema do sistema)
  };

  /**
   * addRow(item)
   * -----------
   * Para cada cliente no array, adiciona uma linha na folha.
   * O ExcelJS mapeia automaticamente as propriedades do objeto
   * para as colunas pela chave (key) definida acima.
   */
  dados.forEach(item => {
    worksheet.addRow(item);
  });

  /**
   * Configura os headers HTTP para que o browser entenda que
   * deve fazer download do ficheiro em vez de exibi-lo.
   *
   * Content-Type  → formato XLSX (padrão Office Open XML)
   * Content-Disposition → força download com o nome "relatorio.xlsx"
   */
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=relatorio.xlsx'
  );

  /**
   * workbook.xlsx.write(res)
   * ------------------------
   * Escreve o conteúdo do workbook diretamente no stream HTTP (res).
   * Ao terminar, chama res.end() para fechar a resposta.
   */
  await workbook.xlsx.write(res);
  res.end();
}

// Exporta a função para uso no RelatorioController
module.exports = {
  gerarExcel
};