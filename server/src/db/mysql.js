import mysql from "mysql2/promise";

function readMysqlConfig() {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "ecard_platform_db"
  };
}

let pool;

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...readMysqlConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }

  return pool;
}

export function getMysqlConfig() {
  return readMysqlConfig();
}

export function getPool() {
  return createPool();
}

export async function query(sql, params) {
  const [rows] = await createPool().execute(sql, params);
  return rows;
}

export async function withTransaction(callback) {
  const connection = await createPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
