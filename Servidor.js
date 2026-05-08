const express = require("express");
const path = require('path');
const rotas = require('./Rotas.js');
const app = express();
const port = 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use('/api', rotas);



app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});



app.listen(port, () => {
  console.log(`Servidor online na porta ${port}`);
});
