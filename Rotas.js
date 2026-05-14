var express = require('express');
var router = express.Router();
const db = require('./db');

console.log('Rotas.js carregado');



/* =========================
   TESTE
========================= */
router.get('/teste', (req, res) => {
  res.send('Servidor funcionando');
});



/* =========================
   USUÁRIOS
========================= */

// Inserir usuário
router.post('/usuarios', (req, res) => {

  const nome = req.body.nomecompleto;

  if (!nome) {
    return res.status(400).send('Nome obrigatório');
  }

  db.query(
    'INSERT INTO usuarios (nome) VALUES (?)',
    [nome],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).send('Erro ao inserir usuário');
      }

      res.send('Usuário inserido com sucesso');
    }
  );
});



// Listar usuários
router.get('/usuarios', (req, res) => {

  db.query('SELECT * FROM usuarios', (err, resultados) => {

    if (err) {
      console.log(err);
      return res.status(500).send('Erro na consulta');
    }

    res.json(resultados);
  });
});


// Buscar usuário por ID
router.get('/usuarios/:id', (req, res) => {

  const id = req.params.id;

  db.query(
    'SELECT * FROM usuarios WHERE id = ?',
    [id],
    (erro, resultado) => {

      if (erro) {
        console.log(erro);
        return res.status(500).send('Erro na consulta');
      }

      res.json(resultado);
    }
  );
});




/* =========================
   LOGIN
========================= */

router.post('/login', (req, res) => {

  console.log('Tentativa de login');

  const email = req.body.email;
  const senha = req.body.senha;

  console.log('Email:', email);
  console.log('Senha:', senha);

  // Verificar campos vazios
  if (!email || !senha) {
    return res.redirect('/login.html?erro=campos');
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';

  db.query(sql, [email, senha], (erro, resultados) => {

    console.log('Resultado da query executado');

    if (erro) {
      console.log('Erro no banco:', erro);
      return res.redirect('/login.html?erro=servidor');
    }

    console.log('Resultados:', resultados);

    // Usuário não encontrado
    if (!resultados || resultados.length === 0) {
      return res.redirect('/login.html?erro=credenciais');
    }

    // Login correto
    console.log('Login realizado com sucesso');

    return res.redirect('/dashboard.html');
  });
});




/* =========================
   CLIENTES
========================= */

// Listar clientes
router.get('/clientes', (req, res) => {

  const { query, status, type } = req.query;

  let sqlQuery = 'SELECT * FROM clientes';
  const params = [];

  if (query) {

    const likeQuery = `%${query}%`;

    if (type === 'apolice') {

      sqlQuery += ' WHERE apolice LIKE ?';
      params.push(likeQuery);

    } else if (type === 'nome') {

      sqlQuery += ' WHERE (nome LIKE ? OR apelido LIKE ?)';
      params.push(likeQuery, likeQuery);

    } else {

      sqlQuery += ' WHERE (nome LIKE ? OR apelido LIKE ? OR apolice LIKE ?)';
      params.push(likeQuery, likeQuery, likeQuery);
    }
  }

  if (status && status.toLowerCase() !== 'todas') {

    sqlQuery += params.length
      ? ' AND estado_apolice = ?'
      : ' WHERE estado_apolice = ?';

    params.push(status);
  }

  sqlQuery += ' ORDER BY nome';

  db.query(sqlQuery, params, (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        erro: 'Erro ao buscar clientes'
      });
    }

    res.json(results);
  });
});

// Cadastrar cliente
router.post('/clientes', (req, res) => {

  const {
    apelido,
    nome,
    apolice,
    ramo,
    matricula,
    marcaModelo,
    anoFabrico,
    quilometragem,
    dataInicio,
    dataFim,
    duracao,
    tipoDuracao,
    contactoPrincipal,
    contactoAlternativo,
    endereco,
    seguradora,
    estadoApolice,
    estadoVeiculo,
    danosVisiveis,
    estadoCarrocaria,
    estadoPneus,
    observacoesAvaliacao,
    parecerSegurabilidade
  } = req.body;

  // Verificação
  if (
    !apelido ||
    !nome ||
    !apolice ||
    !ramo ||
    !contactoPrincipal ||
    !endereco ||
    !seguradora
  ) {

    return res.redirect('/cadastrar-cliente.html?erro=campos');
  }

  // Verificar apólice existente
  db.query(
    'SELECT id FROM clientes WHERE apolice = ?',
    [apolice],
    (err, existing) => {

      if (err) {
        console.log(err);
        return res.redirect('/cadastrar-cliente.html?erro=servidor');
      }

      if (existing.length > 0) {
        return res.redirect('/cadastrar-cliente.html?erro=duplicado');
      }

      // Inserir cliente
      const sql = `
        INSERT INTO clientes (
          apelido,
          nome,
          apolice,
          ramo,
          matricula,
          marca_modelo,
          ano_fabrico,
          quilometragem,
          data_inicio,
          data_fim,
          duracao,
          tipo_duracao,
          contacto_principal,
          contacto_alternativo,
          endereco,
          seguradora,
          estado_apolice,
          estado_veiculo,
          danos_visiveis,
          estado_carrocaria,
          estado_pneus,
          observacoes_avaliacao,
          parecer_segurabilidade
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;

      const valores = [
        apelido,
        nome,
        apolice,
        ramo,
        matricula || null,
        marcaModelo || null,
        anoFabrico || null,
        quilometragem || null,
        dataInicio || null,
        dataFim || null,
        duracao || null,
        tipoDuracao || null,
        contactoPrincipal,
        contactoAlternativo || null,
        endereco,
        seguradora,
        estadoApolice || null,
        estadoVeiculo || null,
        danosVisiveis || null,
        estadoCarrocaria || null,
        estadoPneus || null,
        observacoesAvaliacao || null,
        parecerSegurabilidade || null
      ];

      db.query(sql, valores, (erro) => {

        if (erro) {
          console.log(erro);
          return res.redirect('/cadastrar-cliente.html?erro=servidor');
        }

        console.log('Cliente cadastrado com sucesso');

        res.redirect('/listagem-cliente.html?sucesso=1');
      });
    }
  );
});



/* =========================
   RELATÓRIO
========================= */

router.get('/relatorio', (req, res) => {

    const { inicio, fim, estado, seguradora, formato } = req.query;

    console.log("Filtros do relatório:", req.query);

    let sql = "SELECT * FROM clientes WHERE data_inicio BETWEEN ? AND ?";
    let params = [inicio, fim];

    // filtro estado
    if (estado && estado !== "todos") {
        sql += " AND estado_apolice = ?";
        params.push(estado);
    }

    // filtro seguradora
    if (seguradora && seguradora !== "geral") {
        sql += " AND seguradora = ?";
        params.push(seguradora);
    }

    db.query(sql, params, (err, resultados) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Erro ao gerar relatório");
        }

        // ⚠️ aqui ainda NÃO gera ficheiro real (só retorna dados)
        res.json(resultados);
    });
});







router.get('/relatorio/excel', (req, res) => {

    const { inicio, fim, estado, seguradora } = req.query;

    let sql = `
        SELECT * 
        FROM clientes
        WHERE data_inicio BETWEEN ? AND ?
    `;

    let params = [inicio, fim];

    if (estado && estado !== 'todos') {
        sql += " AND estado_apolice = ?";
        params.push(estado);
    }

    if (seguradora && seguradora !== 'geral') {
        sql += " AND seguradora = ?";
        params.push(seguradora);
    }

    db.query(sql, params, (err, dados) => {

        if (err) {
          console.log("ERRO SQL DETALHADO:", err);
return res.status(500).send(err.message);
        }

        console.log("CLIENTES ENCONTRADOS:", dados);

        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes');

        worksheet.columns = [
            { header: 'Nome', key: 'nome', width: 20 },
            { header: 'Apólice', key: 'apolice', width: 20 },
            { header: 'Seguradora', key: 'seguradora', width: 20 },
            { header: 'Estado', key: 'estado_apolice', width: 20 },
            { header: 'Data Início', key: 'data_inicio', width: 25 },
            { header: 'Data Fim', key: 'data_fim', width: 25 }
        ];

        dados.forEach(item => {
            worksheet.addRow(item);
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=relatorio.xlsx'
        );

        workbook.xlsx.write(res).then(() => res.end());

    });

});

module.exports = router;