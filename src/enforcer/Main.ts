import { Client, Partials, REST, RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody, Routes } from "discord.js";
import BaseCommand from "src/general/classes/BaseCommand";
import fs from "fs";
import EventHandler from "src/general/handlers/EventHandler";
import MongoHandler from "src/enforcer/handlers/MongoHandler";
import dotenv from "dotenv";
import path from "path";
import { dir } from "console";
import WebHandler from "./handlers/WebHandler";
import {GenericBot} from "src/general/classes/GenericBot";
import { MessageHandler } from "./handlers/MessageHandler";

require('@dotenvx/dotenvx').config()

export class Main extends GenericBot {
    static instance: Main;
    private messages = require("../resources/messages.json");
    private mongo: MongoHandler = MongoHandler.getInstance();

    public constructor() {
        super(Main.getBotInfo().token, "src/enforcer/commands");
        MongoHandler.getInstance();

        this.client.on('ready', () => {
            this.startWebHandler();
            MessageHandler.getInstance();
        });
    }

    public static getBotInfo(): { token: string, debug: boolean } {
        return require("src/resources/botconfig.json").enforcer
    }

    startWebHandler(): void {
        WebHandler.getInstance();
    }

    getRandom(key: string): string {
        let list: { message: string, weight: number }[] = this.messages[key];

        let totalWeight = 0;
        for (let i = 0; i < list.length; i++) {
            totalWeight += list[i].weight;
        }

        let random = Math.floor(Math.random() * totalWeight);

        for (let i = 0; i < list.length; i++) {
            random -= list[i].weight;
            if (random <= 0) {
                return list[i].message;
            }
        }

        return "failed to get random message.";
    }

    getMongoHandler(): MongoHandler {
        return this.mongo
    }

    static override getVariables(): Env {
        const info = this.getBotInfo();
        process.env.TOKEN = info.token;
        process.env.DEBUG = info.debug ? "true" : "false";
        return process.env as unknown as Env;
    }

    static override getInstance(): Main {
        if (!Main.instance) return new Main();
        return Main.instance;
    }
}

interface Env {
    APP_PORT: number | undefined;
    DB_CONN_STRING: string | undefined;
    DB_NAME: string | undefined;
    DEBUG: boolean | undefined;
    DEBUG_TOKEN: string | undefined;
    DEBUG_SAVE_CD: number | undefined;
    BOT_TOKEN: string | undefined;
    GUILDS_COLLECTION: string | undefined;
    USERS_COLLECTION: string | undefined;
}