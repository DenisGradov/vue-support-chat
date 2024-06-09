import searchUserIdDb from "./dataBase/searchUserIdDb.mjs";
//libs
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import addUserInDb from "./dataBase/addUserInDb.mjs";
import updateUserMessages from "./dataBase/updateUser.mjs";
import getUserMessages from "./dataBase/getUserMessages.mjs";

const PORT = 3000;

dotenv.config();

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function generateCookieToken() {
    const secretKey = "Arfar1754";
    const randomString = generateRandomString(20);
    const unixTime = Math.floor(Date.now() / 1000);
    const finalString = `${randomString}${unixTime}`;
    return jwt.sign({ finalString }, secretKey, {
        expiresIn: "10y",
    });
}

async function createNewUserAndSetCookie(res) {
    const newCookieToken = generateCookieToken();
    await addUserInDb({ cookieToken: newCookieToken });
    const tenYearsInMs = 10 * 12 * 30 * 24 * 60 * 60 * 1000;
    res.cookie("token", newCookieToken, {
        httpOnly: true,
        maxAge: tenYearsInMs,
        sameSite: "lax",
    });
    return newCookieToken;
}

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: ["http://localhost:8080"], credentials: true }));

app.post("/api/sendMessage", async (req, res) => {
    const cookieToken = req.cookies.token;
    const { newMessage } = req.body;
    console.log(newMessage);
    try {
        const userFind = await searchUserIdDb({
            tableName: "users",
            searchKey: "cookie",
            searchValue: cookieToken,
        });

        if (userFind) {
            await updateUserMessages({ cookieToken, newMessage });
            return res.status(200).json({ success: true, authorized: true });
        } else {
            const newCookieToken = await createNewUserAndSetCookie(res);
            await updateUserMessages({ cookieToken: newCookieToken, newMessage });
            return res.status(200).json({ success: true, authorized: false });
        }
    } catch (err) {
        console.error("Error during authorize:", err);
        return res.status(500).json({ error: err.message });
    }
});

app.post("/api/getMessages", async (req, res) => {
    const cookieToken = req.cookies.token;

    try {
        const userFind = await searchUserIdDb({
            tableName: "users",
            searchKey: "cookie",
            searchValue: cookieToken,
        });

        if (userFind) {
            const messages = await getUserMessages({ cookieToken });
            return res.status(200).json({ success: true, messages });
        } else {
            const newCookieToken = await createNewUserAndSetCookie(res);
            return res.status(200).json({ success: true, authorized: false, newCookieToken });
        }
    } catch (err) {
        console.error("Error during authorize:", err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
