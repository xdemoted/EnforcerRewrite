import { Client, Partials, REST, RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody, Routes } from "discord.js";
import BaseCommand from "src/general/classes/BaseCommand";
import fs from "fs";
import EventHandler from "src/general/handlers/EventHandler";
import MongoHandler from "src/enforcer/handlers/MongoHandler";
import dotenv from "dotenv";
import path from "path";
import { dir } from "console";
import WebHandler from "../general/handlers/WebHandler";
import {Env, GenericBot} from "src/general/classes/GenericBot";
import { Singleton } from "src/container/Singleton";
import { Scope } from "src/container/Scope";

@Singleton
export class Main extends GenericBot {
    private messages = require("../resources/messages.json");

    private mongo: MongoHandler;

    public constructor(mongoHandler: MongoHandler, eventHandler: EventHandler, scope: Scope) {
        super(Main.getBotInfo().token, "src/enforcer/commands", eventHandler, scope);
        this.mongo = mongoHandler;

        this.client.on('ready', () => {
            this.eventHandler?.startEventListeners(this);
        });
    }

    public static getBotInfo(): { token: string, debug: boolean } {
        return require("src/resources/botconfig.json").enforcer
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
}