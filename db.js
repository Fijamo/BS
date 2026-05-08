// Conexão com SQL Server usando o driver mssql
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'DESKTOP-F7VP8TT\\DUARTEFIJAMO',
  database: process.env.DB_DATABASE || 'sistema_bs',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  authentication: {
    type: 'ntlm',
    options: {
      domain: process.env.DB_DOMAIN || '',
      userName: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
    },
  }
};

// Para usar autenticação SQL Server (sa), descomente e configure abaixo.
// const config = {
//   server: process.env.DB_SERVER || 'DESKTOP-F7VP8TT\\DUARTEFIJAMO',
//   database: process.env.DB_DATABASE || 'sistema_bs',
//   user: process.env.DB_USER || 'sa',
//   password: process.env.DB_PASSWORD || 'SuaSenhaAqui',
//   options: {
//     trustServerCertificate: true,
//     enableArithAbort: true,
//     encrypt: true,
//   },
//   connectionTimeout: 30000,
//   requestTimeout: 30000,
// };

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('SQL Server conectado com sucesso');
    return pool;
  })
  .catch((error) => {
    console.error('Erro de conexão SQL Server', error);
    process.exit(1);
  });

module.exports = {
  query: async function (queryText, params = [], callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    const pool = await poolPromise;
    const request = pool.request();

    let paramIndex = 0;
    const sqlQuery = queryText.replace(/\?/g, () => {
      paramIndex += 1;
      return `@p${paramIndex}`;
    });

    params.forEach((value, index) => {
      request.input(`p${index + 1}`, value);
    });

    try {
      const result = await request.query(sqlQuery);
      if (callback) return callback(null, result.recordset);
      return result.recordset;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  },
};