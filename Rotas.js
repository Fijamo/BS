var express = require('express');
var router = express.Router();
const db = require('./db');

console.log('Rotas.js carregado');

router.post("/", (req, res) => {

  const nome = req.body.nomecompleto;

  db.query(
    "INSERT INTO usuarios (nome) VALUES (?)",
    [nome],

    (err, result) => {
      if (err) {
        res.send("Erro ao inserir");
          return;
      }
      res.send("usuario inserido com sucesso");
    }
  );
});


router.get("/", (req, res) => {

db.query("SELECT * FROM usuarios", (err, resultados) => {
  if (err) {
      res.send("Erro na Consulta");
        return;
  }
        res.json(resultados);
  });
});


router.get("/:id", (req, res) => {
    const id = req.params.id

    db.query("SELECT * FROM usuarios where id=?",[id],(erro, resultado) => {
      if (erro) {
        res.send("Erro na Consulta");
        return;
      }
      res.json(resultado);
    });
});
router.post('/login', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  if (!email || !senha) {
    return res.redirect('/login.html?erro=campos');
  }

  db.query(
    'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
    [email, senha],
    (erro, resultados) => {
      if (erro) {
        return res.redirect('/login.html?erro=servidor');
      }

      if (!resultados || resultados.length === 0) {
        return res.redirect('/login.html?erro=credenciais');
      }

      res.redirect('/dashboard.html');
    }
  );
});

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
    parecerSegurabilidade,
  } = req.body;

  if (!apelido || !nome || !apolice || !ramo || !contactoPrincipal || !endereco || !seguradora || !estadoApolice || !parecerSegurabilidade) {
    return res.redirect('/cadastrar-cliente.html?erro=campos');
  }

  db.query(
    `INSERT INTO clientes (
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
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
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
      estadoApolice,
      estadoVeiculo || null,
      danosVisiveis || null,
      estadoCarrocaria || null,
      estadoPneus || null,
      observacoesAvaliacao || null,
      parecerSegurabilidade,
    ],
    (erro) => {
      if (erro) {
        return res.redirect('/cadastrar-cliente.html?erro=servidor');
      }
      res.redirect('/dashboard.html');
    }
  );
});
router.get('/clientes', (req, res) => {
  console.log('Rota /clientes chamada - buscando do SQL Server');
  
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) {
      console.error('ERRO ao buscar clientes:', err);
      return res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
    console.log('Clientes encontrados:', results.length);
    res.json(results);
  });
});

module.exports = router;