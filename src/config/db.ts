import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
console.log('🔧 DB CONFIG:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***HIDDEN***' : undefined,
  database: process.env.DB_NAME,
});

const pool = new Pool({
  
  host: process.env.DB_HOST ,
  port: Number(process.env.DB_PORT) ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log(" Connected to PostgreSQL successfully!");
});

pool.on("error", (err) => {
  console.error(" Unexpected error on PostgreSQL client:", err);
  process.exit(-1);
});

export default pool;
