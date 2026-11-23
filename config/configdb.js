import mysql from 'mysql2'
import *  as dotenv from 'dotenv'
   dotenv.config();
  export  const pool = mysql.createPool({
    host: process.env.HOST,
    user: 'root',
    password: 'root',
     database: process.env.DB,
     ssl: {
       minVersion:'TLSV1.2'
       
     },
     connectionLimit: 10,
     waitForConnections: true,
     queueLimit: 0

  })

