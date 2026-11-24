
import { pool } from "../config/configdb.js";

const dbExecute = async (sql, params = []) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const [results] = await connection.execute(sql, params);

        return results;

    } catch (err) {
        console.error("❌ Database Error:", {
            code: err.code,
            message: err.message,
            sqlMessage: err.sqlMessage
        });

        throw err;

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export default dbExecute;
