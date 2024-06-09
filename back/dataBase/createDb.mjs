import sqlite3 from "sqlite3";
sqlite3.verbose();
import { v4 as uuidv4 } from 'uuid';

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function createDb() {
    const db = new sqlite3.Database("./dataBase.db");

    db.serialize(() => {
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cookie TEXT,
        messages TEXT
      )`
        );

        const randomString = generateRandomString(20);
        const unixTime = Math.floor(Date.now() / 1000);
        const finalString = `${randomString}${unixTime}`;
        const cookieToken = uuidv4();
        const initialMessages = JSON.stringify([]);

        db.run(
            "INSERT INTO users (cookie, messages) VALUES (?, ?)",
            [cookieToken, initialMessages],
            function (err) {
                if (err) {
                    console.error("Error inserting random user:", err);
                } else {
                    console.log("Random user inserted with ID:", this.lastID);
                }
            }
        );
    });

    db.close((err) => {
        if (err) {
            console.error("Error closing the database", err);
        } else {
            console.log("Database closed");
        }
    });
}

createDb();
