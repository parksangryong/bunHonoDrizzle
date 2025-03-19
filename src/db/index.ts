import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2";
import * as dotenv from "dotenv";

dotenv.config();

const poolConnection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

export const connectionResult = () => {
  poolConnection.getConnection((err, connection) => {
    if (err) {
      console.error("데이터베이스 연결 실패:", err);
      return;
    }
    console.log("데이터베이스 연결 성공!");
    connection.release();
  });
};

export const db = drizzle(poolConnection);
