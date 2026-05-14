/**
 * ============================================================
 * models/ClienteModel.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Contém APENAS as operações de base de dados relacionadas
 *   com a tabela "clientes". Nenhuma lógica de HTTP aqui —
 *   só SQL puro.
 *
 *   Padrão usado: cada função recebe os dados necessários e
 *   devolve uma Promise, facilitando o uso com async/await.
 * ============================================================
 */

// Importa a conexão configurada em config/database.js
const db = require('../config/database');

/**
 * listarTodos(filtros)
 * --------------------
 * Busca clientes aplicando filtros opcionais de pesquisa,
 * tipo de campo e estado da apólice.
 *
 * @param {Object} filtros - { query, type, status }
 *   query  → texto a pesquisar (nome, apelido, apólice)
 *   type   → campo específico: 'nome' | 'apolice' | vazio (todos)
 *   status → estado da apólice, ex: 'Ativa', 'Vencida'
 * @returns {Promise<Array>} lista de clientes encontrados
 */
function listarTodos(filtros = {}) {

  return new Promise((resolve, reject) => {

    const { query, status, type } = filtros;

    // Base da query — sem filtros retorna todos os clientes
    let sql = 'SELECT * FROM clientes';
    const params = [];

    // Aplica filtro de texto se fornecido
    if (query) {
      const like = `%${query}%`;  // % = qualquer texto antes/depois

      if (type === 'apolice') {
        // Pesquisa só pelo número da apólice
        sql += ' WHERE apolice LIKE ?';
        params.push(like);

      } else if (type === 'nome') {
        // Pesquisa pelo nome OU apelido
        sql += ' WHERE (nome LIKE ? OR apelido LIKE ?)';
        params.push(like, like);

      } else {
        // Pesquisa em todos os campos relevantes
        sql += ' WHERE (nome LIKE ? OR apelido LIKE ? OR apolice LIKE ?)';
        params.push(like, like, like);
      }
    }

    // Aplica filtro de estado da apólice (se não for "todas")
    if (status && status.toLowerCase() !== 'todas') {
      // Se já tem WHERE usa AND, senão começa com WHERE
      sql += params.length ? ' AND estado_apolice = ?' : ' WHERE estado_apolice = ?';
      params.push(status);
    }

    // Ordena os resultados por nome, A → Z
    sql += ' ORDER BY nome';

    // Executa a query no MySQL
    db.query(sql, params, (err, resultados) => {
      if (err) return reject(err);   // algo correu mal → rejeita a promise
      resolve(resultados);           // sucesso → resolve com os dados
    });
  });
}

/**
 * buscarPorId(id)
 * ---------------
 * Retorna um único cliente pelo seu ID numérico.
 *
 * @param {number|string} id - ID do cliente na tabela
 * @returns {Promise<Object|null>} cliente encontrado ou null
 */
function buscarPorId(id) {

  return new Promise((resolve, reject) => {

    db.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id],
      (err, resultado) => {
        if (err) return reject(err);
        // resultado é sempre um array; [0] pega o primeiro registo
        resolve(resultado[0] || null);
      }
    );
  });
}

/**
 * verificarApoliceExistente(apolice)
 * -----------------------------------
 * Verifica se já existe um cliente com o número de apólice
 * informado, evitando duplicados no cadastro.
 *
 * @param {string} apolice - número da apólice a verificar
 * @returns {Promise<boolean>} true se já existe, false se livre
 */
function verificarApoliceExistente(apolice) {

  return new Promise((resolve, reject) => {

    db.query(
      'SELECT id FROM clientes WHERE apolice = ?',
      [apolice],
      (err, resultado) => {
        if (err) return reject(err);
        resolve(resultado.length > 0); // true = apólice já cadastrada
      }
    );
  });
}

/**
 * criar(dados)
 * ------------
 * Insere um novo cliente na tabela "clientes".
 *
 * @param {Object} dados - todos os campos do formulário de cadastro
 * @returns {Promise<Object>} resultado da query (inclui insertId)
 */
function criar(dados) {

  return new Promise((resolve, reject) => {

    // Query com todos os campos da tabela clientes
    const sql = `
      INSERT INTO clientes (
        apelido, nome, apolice, ramo,
        matricula, marca_modelo, ano_fabrico, quilometragem,
        data_inicio, data_fim, duracao, tipo_duracao,
        contacto_principal, contacto_alternativo, endereco, seguradora,
        estado_apolice, estado_veiculo, danos_visiveis,
        estado_carrocaria, estado_pneus,
        observacoes_avaliacao, parecer_segurabilidade
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    // Valores na mesma ordem das colunas acima
    // || null converte string vazia para NULL no banco
    const valores = [
      dados.apelido,
      dados.nome,
      dados.apolice,
      dados.ramo,
      dados.matricula           || null,
      dados.marcaModelo         || null,
      dados.anoFabrico          || null,
      dados.quilometragem       || null,
      dados.dataInicio          || null,
      dados.dataFim             || null,
      dados.duracao             || null,
      dados.tipoDuracao         || null,
      dados.contactoPrincipal,
      dados.contactoAlternativo || null,
      dados.endereco,
      dados.seguradora,
      dados.estadoApolice       || null,
      dados.estadoVeiculo       || null,
      dados.danosVisiveis       || null,
      dados.estadoCarrocaria    || null,
      dados.estadoPneus         || null,
      dados.observacoesAvaliacao   || null,
      dados.parecerSegurabilidade  || null
    ];

    db.query(sql, valores, (err, resultado) => {
      if (err) return reject(err);
      resolve(resultado); // resultado.insertId contém o ID gerado
    });
  });
}

/**
 * buscarParaRelatorio(filtros)
 * ----------------------------
 * Retorna clientes dentro de um intervalo de datas, com
 * filtros adicionais de estado e seguradora. Usado para
 * gerar relatórios em JSON e Excel.
 *
 * @param {Object} filtros - { inicio, fim, estado, seguradora }
 * @returns {Promise<Array>}
 */
function buscarParaRelatorio(filtros = {}) {

  return new Promise((resolve, reject) => {

    const { inicio, fim, estado, seguradora } = filtros;

    // Filtra pelo intervalo de datas obrigatório
    let sql = 'SELECT * FROM clientes WHERE data_inicio BETWEEN ? AND ?';
    const params = [inicio, fim];

    // Filtro opcional de estado da apólice
    if (estado && estado !== 'todos') {
      sql += ' AND estado_apolice = ?';
      params.push(estado);
    }

    // Filtro opcional de seguradora
    if (seguradora && seguradora !== 'geral') {
      sql += ' AND seguradora = ?';
      params.push(seguradora);
    }

    db.query(sql, params, (err, resultados) => {
      if (err) return reject(err);
      resolve(resultados);
    });
  });
}

// Exporta todas as funções para serem usadas nos controllers
module.exports = {
  listarTodos,
  buscarPorId,
  verificarApoliceExistente,
  criar,
  buscarParaRelatorio
};