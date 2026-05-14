var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// IMPORTAÇÃO DAS ROTAS
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./Rotas');

var app = express();

/* =====================================
   CONFIGURAÇÃO DAS VIEWS
===================================== */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* =====================================
   MIDDLEWARES
===================================== */

app.use(logger('dev'));

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

/* =====================================
   ROTAS PRINCIPAIS
===================================== */

// Página inicial
app.use('/', indexRouter);

// Usuários
app.use('/users', usersRouter);

// API DO SISTEMA
// LOGIN
// CLIENTES
// PESQUISA
// CADASTRO
app.use('/api', apiRouter);

console.log('✅ Rotas carregadas com sucesso');

/* =====================================
   TESTE DO SERVIDOR
===================================== */

app.get('/teste', (req, res) => {
  res.send('Servidor funcionando corretamente');
});

/* =====================================
   ERRO 404
===================================== */

app.use((req, res, next) => {

  console.log('❌ Rota não encontrada:', req.originalUrl);

  next(createError(404));

});

/* =====================================
   TRATAMENTO DE ERROS
===================================== */

app.use((err, req, res, next) => {

  console.error('ERRO:', err.message);

  res.status(err.status || 500);

  res.send(`
    <h1>Erro ${err.status || 500}</h1>
    <p>${err.message}</p>
    <p>URL: ${req.originalUrl}</p>
  `);

});


app.use(express.static('public'));

module.exports = app;