import pool from "../config/database.js";

export async function healthCheck(request, response, next) {
    try {
        // Executa uma query simples para testar se a base de dados está ativa
        const [rows] = await pool.query("SELECT 1 AS ok");
        const databaseConnected = rows[0]?.ok === 1;

        response.json({
            status: "ok",
            database: databaseConnected ? "connected" : "disconnected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        next(error);
    }
}