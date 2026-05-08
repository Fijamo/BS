const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'sistema_bs',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

sql.connect(config)
  .then(() => {
    console.log('Conectado ao SQL Server!');
    return sql.close();
  })
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });