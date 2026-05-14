/**
 * ============================================================
 * controllers/ClienteController.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Contém as funções que tratam as requisições HTTP ligadas
 *   a clientes. Recebe (req, res), chama o Model para obter
 *   ou gravar dados, e devolve a resposta ao navegador.
 *
 *   NÃO faz SQL direto — delega ao ClienteModel.
 *   NÃO tem lógica de negócio complexa — isso vai em Services.
 * ============================================================
 */

// Model responsável pelas queries de clientes
const ClienteModel = require('../models/ClienteModel');

/**
 * listar(req, res)
 * ----------------
 * Rota  : GET /api/clientes
 * Ação  : Busca clientes com filtros opcionais via query string.
 *
 * Query string esperada (todos opcionais):
 *   ?query=João        → pesquisa por texto
 *   ?type=nome         → tipo de campo a pesquisar
 *   ?status=Ativa      → filtro por estado da apólice
 */
async function listar(req, res) {

  try {
    // req.query contém os parâmetros passados na URL (?key=valor)
    const filtros = req.query;

    // Chama o model para executar o SQL com os filtros
    const clientes = await ClienteModel.listarTodos(filtros);

    // Retorna os dados como JSON para o front-end consumir
    res.json(clientes);

  } catch (erro) {
    console.error('Erro ao listar clientes:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
}

/**
 * buscarPorId(req, res)
 * ----------------------
 * Rota  : GET /api/clientes/:id
 * Ação  : Retorna um cliente específico pelo ID da URL.
 *
 * Parâmetro de rota:
 *   :id → número inteiro do cliente
 */
async function buscarPorId(req, res) {

  try {
    // req.params contém os segmentos dinâmicos da URL (/:id)
    const id = req.params.id;

    const cliente = await ClienteModel.buscarPorId(id);

    if (!cliente) {
      // Cliente não existe no banco → responde 404
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);

  } catch (erro) {
    console.error('Erro ao buscar cliente:', erro.message);
    res.status(500).json({ erro: 'Erro interno' });
  }
}

/**
 * cadastrar(req, res)
 * --------------------
 * Rota  : POST /api/clientes
 * Ação  : Valida os campos obrigatórios e cadastra o cliente.
 *
 * Body esperado (application/x-www-form-urlencoded ou JSON):
 *   apelido, nome, apolice, ramo, contactoPrincipal,
 *   endereco, seguradora  ← obrigatórios
 *   + campos opcionais do formulário
 */
async function cadastrar(req, res) {

  try {
    // req.body contém os dados enviados pelo formulário HTML
    const dados = req.body;

    // --- Validação dos campos obrigatórios ---
    // Se algum estiver vazio, redireciona com mensagem de erro
    const obrigatorios = [
      'apelido', 'nome', 'apolice', 'ramo',
      'contactoPrincipal', 'endereco', 'seguradora'
    ];

    for (const campo of obrigatorios) {
      if (!dados[campo]) {
        return res.redirect('/cadastrar-cliente.html?erro=campos');
      }
    }

    // --- Verificar apólice duplicada ---
    // Garante que o número de apólice ainda não está registado
    const existe = await ClienteModel.verificarApoliceExistente(dados.apolice);

    if (existe) {
      return res.redirect('/cadastrar-cliente.html?erro=duplicado');
    }

    // --- Inserir no banco ---
    await ClienteModel.criar(dados);

    console.log('✅ Cliente cadastrado:', dados.nome);

    // Redireciona para a listagem com mensagem de sucesso
    res.redirect('/listagem-cliente.html?sucesso=1');

  } catch (erro) {
    console.error('Erro ao cadastrar cliente:', erro.message);
    res.redirect('/cadastrar-cliente.html?erro=servidor');
  }
}

// Exporta cada função individualmente para ser usada no Router
module.exports = {
  listar,
  buscarPorId,
  cadastrar
};