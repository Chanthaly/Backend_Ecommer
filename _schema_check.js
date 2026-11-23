import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({ host: process.env.HOST, user: 'root', password: 'root', database: process.env.DB });
(async () => {
  const conn = await pool.getConnection();
  const [rows] = await conn.query('SHOW COLUMNS FROM customer');
  console.log(JSON.stringify(rows, null, 2));
  await conn.release();
  await pool.end();
})();
