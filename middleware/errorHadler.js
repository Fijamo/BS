/**
 * ============================================================
 * middleware/errorHandler.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Middleware de tratamento de erros global da aplicação.
 *   Captura qualquer erro que seja passado via next(erro) em
 *   qualquer rota ou middleware anterior.
 *
 * O que é um Middleware?
 *   É uma função com assinatura (req, res, next) que intercepta
 *   a requisição antes ou depois da rota. Pode modificar req/res,
 *   validar dados, tratar erros, etc.
 *
 *   Middleware de erro tem 4 parâmetros: (err, req, res, next).
 *   O Express identifica automaticamente que é de erro pela
 *   presença do primeiro parâmetro "err".
 * ============================================================
 */

/**
 * notFound(req, res, next)
 * -------------------------
 * Middleware 404 — é executado quando NENHUMA rota anterior
 * correspondeu ao endereço pedido pelo cliente.
 *
 * @param {Object} req  - objeto da requisição HTTP
 * @param {Object} res  - objeto da resposta HTTP
 * @param {Function} next - função para passar ao próximo middleware
 */
function notFound(req, res, next) {

  // Regista no terminal qual URL não foi encontrada
  console.log('❌ Rota não encontrada:', req.originalUrl);

  // Cria um erro com status 404 e passa para o handler de erros abaixo
  const erro = new Error(`Página não encontrada: ${req.originalUrl}`);
  erro.status = 404;

  // next(erro) pula para o próximo middleware de erro (4 parâmetros)
  next(erro);
}

/**
 * errorHandler(err, req, res, next)
 * -----------------------------------
 * Middleware de erro global — captura qualquer erro gerado
 * por rotas ou middlewares anteriores via next(erro).
 *
 * Exemplos de quando é chamado:
 *   - Rota não encontrada (passada pelo notFound acima)
 *   - Erro de banco de dados lançado com next(err)
 *   - Qualquer throw dentro de um middleware
 *
 * @param {Error}    err  - objeto de erro com message e status
 * @param {Object}   req  - requisição HTTP
 * @param {Object}   res  - resposta HTTP
 * @param {Function} next - não usado, mas obrigatório na assinatura
 */
function errorHandler(err, req, res, next) {

  // Regista o erro completo no terminal do servidor
  console.error('🔴 ERRO:', err.message);

  // Define o código HTTP: usa o do erro se existir, senão 500
  const status = err.status || 500;

  // Responde com HTML simples de erro (sem alterar o CSS existente)
  res.status(status).send(`
    <h1>Erro ${status}</h1>
    <p>${err.message}</p>
    <p>URL: ${req.originalUrl}</p>
    <a href="/">Voltar ao início</a>
  `);
}

// Exporta ambos os middlewares para serem registados no app.js
module.exports = {
  notFound,
  errorHandler
};