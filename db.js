const mysql = require('mysql2');

const connection = mysql.createConnection({

  host: 'localhost',

  user: 'root',

  password: 'Josecarlos123',

  database: 'sistema_bs',

  port: 3306

});

connection.connect((err) => {

  if (err) {
    console.log('Erro ao conectar no MySQL');
    console.log(err);
    return;
  }

  console.log('MySQL conectado com sucesso');

});

module.exports = connection;