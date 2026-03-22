import { Client, Partials, REST, Routes } from "discord.js";
import BaseCommand from "./BaseCommand";
import fs from "fs";
import EventHandler from "../handlers/EventHandler";
import { Scope } from "src/container/Scope";

export class GenericBot {
    public client: Client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
    public commands: BaseCommand[] = [];
    public token: string | undefined;
    public lockdown: boolean = false;
    public allowedUsers: string[] = ["316243027423395841"];
    public commandDirectory: string;
    public eventHandler?: EventHandler;

    public constructor(token: string, commandDirectory: string, eventHandler: EventHandler, scope: Scope) {
        console.log(`Begin login for [${commandDirectory}]`);
        this.commandDirectory = commandDirectory;
        this.token = token;

        if (GenericBot.getVariables().DEBUG) this.lockdown = true;

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);

            scope.awaitComplete().then(() => {
                this.loadCommands(scope);
                this.registerCommands();
            });
            
            eventHandler.startEventListeners(this);
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

    loadCommands(scope: Scope) {
        scope.get(BaseCommand).forEach(command => this.commands.push(command));
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

    static getVariables(): Env {
        return process.env as unknown as Env;
    }
}

export interface Env {
    APP_PORT: string | undefined;
    DB_CONN_STRING: string | undefined;
    DB_NAME: string | undefined;
    DEBUG: boolean | undefined;
    DEBUG_TOKEN: string | undefined;
    DEBUG_SAVE_CD: number | undefined;
    BOT_TOKEN: string | undefined;
    GUILDS_COLLECTION: string | undefined;
    USERS_COLLECTION: string | undefined;
    URL_PREFIX: string | undefined;
}