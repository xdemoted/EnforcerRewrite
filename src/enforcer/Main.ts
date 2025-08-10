import { Client, Partials, REST, Routes } from "discord.js";
import BaseCommand from "./classes/BaseCommand";
import fs from "fs";
import ActivityHandler from "./stat-tracking/ActivityHandler";
import EventHandler from "./handlers/EventHandler";
import MongoHandler from "./handlers/MongoHandler";
import dotenv from "dotenv";
import path from "path";

require('@dotenvx/dotenvx').config()
process.chdir("./src/enforcer");

export class Main {
    private static instance: Main = new Main();

    private client: Client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
    private commands: BaseCommand[] = [];
    private messages = require("../resources/messages.json");
    private activityHandler: ActivityHandler = new ActivityHandler();
    private eventHandler?: EventHandler;
    private mongo: MongoHandler = MongoHandler.getInstance();
    private token: string | undefined;
    private lockdown: boolean = false;
    private allowedUsers: string[] = ["316243027423395841"];

    private constructor() {
        MongoHandler.getInstance();

        if (Main.getVariables().DEBUG) this.lockdown = true;

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);

            this.loadCommands();
            this.registerCommands();

            this.eventHandler = new EventHandler(this);
        });

        this.login();
    }

    login() {
        const variables = Main.getVariables();
        if (variables.DEBUG && variables.DEBUG_TOKEN) {
            console.log("Debug mode enabled. Using test token.");
            this.token = variables.DEBUG_TOKEN;
            this.client.login(variables.DEBUG_TOKEN);
        } else if (variables.BOT_TOKEN) {
            console.log("Using production token.");
            this.token = variables.BOT_TOKEN;
            this.client.login(variables.BOT_TOKEN);
        } else {
            console.error("No bot token provided in environment variables.");
        }
    }

    addAllowedUser(userID: string): void {
        this.allowedUsers.push(userID);
    }

    removeAllowedUser(userID: string): void {
        this.allowedUsers = this.allowedUsers.filter(id => id !== userID);
    }

    getAllowedUsers(): string[] {
        return this.allowedUsers;
    }

    toggleLockdown(): void {
        this.lockdown = !this.lockdown;
    }

    getLockdown(): boolean {
        return this.lockdown;
    }


    getActivityHandler(): ActivityHandler {
        return this.activityHandler;
    }

    getClient(): Client {
        return this.client;
    }

    loadDirectory(directory: string, level = 1) {
        const debugPrefix = " -".repeat(level) + " ";

        const files = fs.readdirSync(directory);

        // Sort: files first, directories last
        files.sort((a, b) => {
            const aIsDir = !a.includes(".") && fs.statSync(`${directory}/${a}`).isDirectory();
            const bIsDir = !b.includes(".") && fs.statSync(`${directory}/${b}`).isDirectory();
            if (aIsDir === bIsDir) return 0;
            return aIsDir ? 1 : -1;
        });

        files.forEach(file => {
            console.log(debugPrefix + file);
            if (!file.includes(".") && fs.statSync(`${directory}/${file}`).isDirectory()) {
            this.loadDirectory(`${directory}/${file}`, level + 1);
            return;
            }

            if (!(file.endsWith(".js") || file.endsWith(".ts"))) return;

            let command = require(`${directory}/${file}`);

            if (command instanceof BaseCommand) {
            this.commands.push(command);
            }
        });
    }

    loadCommands() {
        console.log("Loading commands:");
        this.loadDirectory("./commands");
    }

    registerCommands() {
        const rest = new REST({ version: '10' }).setToken(this.token || '');

        (async () => {
            try {
                await rest.put(
                    Routes.applicationCommands(this.client.user?.id || ''),
                    { body: this.commands.map(command => command.getCommand()) },
                );
            } catch (error) {
                console.error(error);
            }
        })();
    }

    getCommands(): BaseCommand[] {
        return this.commands;
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

    static getInstance(): Main {
        return Main.instance;
    }

    static getVariables(): Env {
        return process.env as unknown as Env;
    }
}

interface Env {
    DB_CONN_STRING: string | undefined;
    DB_NAME: string | undefined;
    DEBUG: boolean | undefined;
    DEBUG_TOKEN: string | undefined;
    DEBUG_SAVE_CD: number | undefined;
    BOT_TOKEN: string | undefined;
    GUILDS_COLLECTION: string | undefined;
    USERS_COLLECTION: string | undefined;
}