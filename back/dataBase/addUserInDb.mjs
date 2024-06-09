import sqlite3 from "sqlite3";
import {fileURLToPath} from "url";
import path from "node:path";
sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "dataBase.db");

export default function addUserInDb({ cookieToken }) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        db.run(
            "INSERT INTO users (cookie, messages) VALUES (?, ?)",
            [cookieToken, JSON.stringify([])], // Инициализируем поле messages пустым массивом
            function (err) {
                if (err) {
                    console.error("Ошибка при записи в базу данных:", err);
                    db.close();
                    return reject(new Error("Ошибка при записи в базу данных"));
                } else {
                    console.log("Пользователь добавлен с ID:", this.lastID);
                    db.close();
                    return resolve(true);
                }
            }
        );
    });
}


