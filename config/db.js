// const mysql = require('mysql2');

// const connectionPool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'mocktest',
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Promise wrapper format for cleaner async/await async code stream handling execution
// const db = connectionPool.promise();
// module.exports = db;
const mysql = require('mysql2/promise');

// Live 24/7 Aiven Cloud MySQL database connection setups
const dbPoolGridConnection = mysql.createPool({
  host: '://aivencloud.com',
  port: 26713,
  user: 'avnadmin',
  
  // =========================================================================================================
  // KINDHA UNNA SINGLE QUOTES (' ') MADHYA LO MEERU REVEAL CHESI COPY CHESINA PASSWORD NI PASTE CHEYANDI
  // =========================================================================================================
  password: 'MEERU_COPY_CHESINA_PASSWORD_IKKADA_PETTANDI', 
  // =========================================================================================================
  
  database: 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // Cloud database handshake encryption bypass cheyడానికి idhi mandatory
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = dbPoolGridConnection;
