/**
 * ============================================================
 * controllers/RelatorioController.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Trata as requisições de geração de relatórios.
 *   Busca dados via ClienteModel e usa o RelatorioService
 *   para montar e devolver o ficheiro Excel.
 * ============================================================
 */

// Model de clientes para buscar os dados do banco
const ClienteModel = require('../models/ClienteModel');

// Service responsável por criar o ficheiro Excel
const RelatorioService = require('../services/RelatorioService');

/**
 * gerarJSON(req, res)
 * --------------------
 * Rota  : GET /api/relatorio
 * Ação  : Retorna os dados filtrados como JSON puro.
 *         Usado pelo front-end para exibir prévia do relatório.
 *
 * Query string esperada:
 *   ?inicio=2024-01-01  → data de início (obrigatório)
 *   ?fim=2024-12-31     → data de fim (obrigatório)
 *   ?estado=Ativa       → filtro opcional de estado
 *   ?seguradora=Nome    → filtro opcional de seguradora
 */
async function gerarJSON(req, res) {

  try {
    console.log('📊 Filtros do relatório:', req.query);

    // Busca os dados no banco com os filtros da URL
    const dados = await ClienteModel.buscarParaRelatorio(req.query);

    // Devolve o array de clientes como JSON
    res.json(dados);

  } catch (erro) {
    console.error('Erro ao gerar relatório JSON:', erro.message);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
}

/**
 * gerarExcel(req, res)
 * ---------------------
 * Rota  : GET /api/relatorio/excel
 * Ação  : Gera um ficheiro .xlsx com os dados filtrados e
 *         força o download no navegador do utilizador.
 *
 * Query string: igual ao gerarJSON acima.
 */
async function gerarExcel(req, res) {

  try {
    // Reutiliza a mesma busca com filtros
    const dados = await ClienteModel.buscarParaRelatorio(req.query);

    console.log('📋 Clientes para Excel:', dados.length);

    // Delega a criação do ficheiro Excel ao service especializado
    // O service escreve diretamente no objeto res (stream)
    await RelatorioService.gerarExcel(dados, res);

  } catch (erro) {
    console.error('Erro ao gerar Excel:', erro.message);
    res.status(500).send('Erro ao gerar ficheiro Excel');
  }
}

// Exporta as funções do controller
module.exports = {
  gerarJSON,
  gerarExcel
};