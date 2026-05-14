/**
 * ============================================================
 * models/UsuarioModel.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Operações de banco de dados relacionadas à tabela
 *   "usuarios" — busca por email/senha (login), inserção
 *   e listagem.
 * ============================================================
 */

// Conexão com o MySQL
const db = require('../config/database');

/**
 * buscarPorEmailESenha(email, senha)
 * ------------------------------------
 * Procura um utilizador que corresponda ao email E senha
 * fornecidos. Usado na validação do login.
 *
 * NOTA: Em produção, a senha deveria ser guardada como hash
 * (bcrypt). Aqui está em texto simples para manter a lógica
 * já existente no projeto.
 *
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<Object|null>} utilizador encontrado ou null
 */
function buscarPorEmailESenha(email, senha) {

  return new Promise((resolve, reject) => {

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';

    db.query(sql, [email, senha], (err, resultados) => {
      if (err) return reject(err);
      // Retorna o primeiro resultado ou null se não encontrou
      resolve(resultados.length > 0 ? resultados[0] : null);
    });
  });
}

/**
 * inserir(nome)
 * -------------
 * Cadastra um novo utilizador com apenas o nome.
 * (Funcionalidade básica — pode ser expandida com email/senha.)
 *
 * @param {string} nome - nome completo do utilizador
 * @returns {Promise<Object>} resultado da query (inclui insertId)
 */
function inserir(nome) {

  return new Promise((resolve, reject) => {

    db.query(
      'INSERT INTO usuarios (nome) VALUES (?)',
      [nome],
      (err, resultado) => {
        if (err) return reject(err);
        resolve(resultado);
      }
    );
  });
}

/**
 * listarTodos()
 * -------------
 * Retorna todos os utilizadores cadastrados.
 * Usado na rota GET /api/usuarios.
 *
 * @returns {Promise<Array>} lista de utilizadores
 */
function listarTodos() {

  return new Promise((resolve, reject) => {

    db.query('SELECT * FROM usuarios', (err, resultados) => {
      if (err) return reject(err);
      resolve(resultados);
    });
  });
}

/**
 * buscarPorId(id)
 * ---------------
 * Retorna um utilizador específico pelo ID.
 *
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
function buscarPorId(id) {

  return new Promise((resolve, reject) => {

    db.query(
      'SELECT * FROM usuarios WHERE id = ?',
      [id],
      (err, resultado) => {
        if (err) return reject(err);
        resolve(resultado[0] || null);
      }
    );
  });
}

// Exporta as funções para uso nos controllers
module.exports = {
  buscarPorEmailESenha,
  inserir,
  listarTodos,
  buscarPorId
};