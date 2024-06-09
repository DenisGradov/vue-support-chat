import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import path from "node:path";
sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "dataBase.db");

export default function getUserMessages({ cookieToken }) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        const sqlSelect = `SELECT messages FROM users WHERE cookie = ?`;
        db.get(sqlSelect, [cookieToken], (err, row) => {
            if (err) {
                console.error("Ошибка при получении сообщений из базы данных:", err);
                db.close();
                return reject(new Error("Ошибка при получении сообщений из базы данных"));
            }

            let messages = [];
            if (row && row.messages) {
                messages = JSON.parse(row.messages);
            }

            db.close((err) => {
                if (err) {
                    console.error("Ошибка при закрытии базы данных:", err);
                    return reject(new Error("Ошибка при закрытии базы данных"));
                }
                return resolve(messages);
            });
        });
    });
}
