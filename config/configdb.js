import mysql from 'mysql2'
import *  as dotenv from 'dotenv'
   dotenv.config();
  export  const pool = mysql.createPool({
    host: process.env.HOST,
    user: 'root',
    password: 'root',
     database: process.env.DB,
     connectionLimit: 10,
     waitForConnections: true,
     queueLimit: 0

  })

