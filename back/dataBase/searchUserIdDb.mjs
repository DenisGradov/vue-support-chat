import sqlite3 from "sqlite3";
sqlite3.verbose();
import { fileURLToPath } from "url";
import * as path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "dataBase.db");

export default function searchUserIdDb({ tableName, searchKey, searchValue }) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(
            dbPath,
            sqlite3.OPEN_READONLY,
            (err) => {
                if (err) {
                    console.error(err.message);
                    return reject(new Error(err.message));
                }
            }
        );

        const sql = `SELECT * FROM ${tableName} WHERE ${searchKey} = ?`;

        db.get(sql, [searchValue], (err, row) => {
            if (err) {
                return reject(new Error(err.message));
            }
            if (row && row[searchKey] === searchValue) {
                return resolve(true); // Пользователь найден
            } else {
                return resolve(false); // Пользователь не найден
            }
        });

        db.close((err) => {
            if (err) {
                return reject(new Error(err.message));
            }
        });
    });
}

