import { Client, Partials, REST, Routes } from "discord.js";
import BaseCommand from "./BaseCommand";
import fs from "fs";
import EventHandler from "../handlers/EventHandler";

export class GenericBot {
    public client: Client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
    public commands: BaseCommand[] = [];
    public token: string | undefined;
    public lockdown: boolean = false;
    public allowedUsers: string[] = ["316243027423395841"];
    public commandDirectory: string;
    public eventHandler?: EventHandler;

    public constructor(token: string, commandDirectory: string) {
        console.log(`Begin login for [${commandDirectory}]`);
        this.commandDirectory = commandDirectory;
        this.token = token;

        if (GenericBot.getVariables().DEBUG) this.lockdown = true;

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);

            this.loadCommands();
            this.registerCommands();
            this.eventHandler = new EventHandler(this);
        });

        this.client.login(token);
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

                if (directory.includes("restricted")) {
                    command.restricted = true;
                }
            }
        });
    }

    loadCommands() {
        console.log("Loading commands:");
        this.loadDirectory(this.commandDirectory);
    }

    registerCommands() {
        const rest = new REST({ version: '10' }).setToken(this.token || '');

        (async () => {
            try {
                await rest.put(
                    Routes.applicationCommands(this.client.user?.id || ''),
                    { body: [...this.commands.map(command => command.getCommand()), {name: "launch", type: 4} as any] },
                );
            } catch (error) {
                console.error(error);
            }
        })();
    }

    getCommands(): BaseCommand[] {
        return this.commands;
    }
    
    public static getInstance(): GenericBot {
        throw new Error("Get instance method not implemented.");
    }

    static getVariables(): Env {
        return process.env as unknown as Env;
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