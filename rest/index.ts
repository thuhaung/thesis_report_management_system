import express, { Express, Request, Response } from "express";
import { Consumer } from "./rabbitmq/consumer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import db from "./database/config";
import Router from "./routes";
import cors from "cors";

export const app: Express = express();
dotenv.config();
const port: number = parseInt(process.env.PORT!);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: "50mb"}));
app.use(express.json());
app.use(cors());

db.connect();

app.listen(port, async () => {
    const consumer = new Consumer();
    consumer.listenMessage();

    console.log(`\nApp is running on port ${port}`);
});

Router(app);

