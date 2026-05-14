/**
 * ============================================================
 * controllers/AuthController.js
 * ------------------------------------------------------------
 * Responsabilidade:
 *   Trata as requisições de autenticação — login e logout.
 *   Usa o UsuarioModel para verificar as credenciais.
 * ============================================================
 */

// Model que acede à tabela de utilizadores
const UsuarioModel = require('../models/UsuarioModel');

/**
 * login(req, res)
 * ---------------
 * Rota  : POST /api/login
 * Ação  : Valida email e senha. Se corretos, redireciona para
 *         o dashboard; caso contrário, redireciona com erro.
 *
 * Body esperado:
 *   email → endereço de email do utilizador
 *   senha → palavra-passe (sem hash por agora)
 */
async function login(req, res) {

  try {
    console.log('🔐 Tentativa de login recebida');

    // req.body.email e req.body.senha vêm do formulário login.html
    const { email, senha } = req.body;

    console.log('📧 Email recebido:', email);

    // Campos obrigatórios — se vazios, volta ao login com erro
    if (!email || !senha) {
      return res.redirect('/login.html?erro=campos');
    }

    // Delega a verificação ao Model
    const usuario = await UsuarioModel.buscarPorEmailESenha(email, senha);

    if (!usuario) {
      // Email ou senha errados
      console.log('❌ Credenciais inválidas para:', email);
      return res.redirect('/login.html?erro=credenciais');
    }

    // Credenciais corretas → acesso permitido
    console.log('✅ Login realizado com sucesso:', email);
    return res.redirect('/dashboard.html');

  } catch (erro) {
    console.error('Erro no login:', erro.message);
    return res.redirect('/login.html?erro=servidor');
  }
}

// Exporta a função de login
module.exports = {
  login
};