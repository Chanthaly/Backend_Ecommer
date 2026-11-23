import { pool } from "../config/configdb.js";
 const dbExecute = async(sql,params=[]) => {
  let connection;
try
{

connection = await  pool.promise().getConnection();
const   [results] =  await connection.execute(sql,params)
return results;

}
catch(err) {
 console.log(` ❌ connection error  please check the database tryagain`,err)
 throw err;
}
finally{

    if (connection) 
        connection.release();
}

  };
export default dbExecute;