import { Client, Partials, REST, Routes } from "discord.js";
import BaseCommand from "./classes/BaseCommand";
import fs from "fs";
import ActivityHandler from "./stat-tracking/ActivityHandler";
import FileHandler from "./utils/FileHandler";

export class Main {
    private static client: Client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
    private static commands: BaseCommand[] = [];
    private static messages = require("../resources/messages.json");
    private static activityHandler: ActivityHandler = new ActivityHandler();
    private static fileHandler: FileHandler = new FileHandler();

    static start(): void {
        require('dotenv').config({ path: "../resources/config.env" }); // Load environment variables

        if (!process.env.BOT_TOKEN) {
            console.error("No bot token provided.");
            return;
        }

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);

            this.loadCommands();
            this.registerCommands();

            console.log("The following commands are registered:");
            this.commands.forEach(command => {
                console.log(`- ${command.getCommand().name}`);
            });

            this.startCommandListener();
        });

        this.client.on('presenceUpdate', (oldPresence, presence) => {
            let member = presence?.member
            if (member) {
                this.activityHandler.processMember(member);
            }
        });

        this.test();

        this.client.login(process.env.BOT_TOKEN);
    }

    static getActivityHandler(): ActivityHandler {
        return this.activityHandler;
    }

    static getFileHandler(): FileHandler {
        return this.fileHandler;
    }

    static getClient(): Client {
        return this.client;
    }

    static loadCommands() {
        fs.readdirSync("./commands").forEach(file => {
            if (!file.endsWith(".js")) return;

            let command = require(`./commands/${file}`);

            if (command instanceof BaseCommand)
                this.commands.push(command);
        });
    }

    static registerCommands() {
        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || '');

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

    static startCommandListener() {
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const command = this.commands.find(command => command.getCommand().name === interaction.commandName);

            if (command) {
                try {
                    command.execute(interaction);
                } catch (error) {
                    console.error("Man this shit is fucked: " + command.getCommand().name)
                }
            }
        });
    }

    static getRandom(key: string): string {
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

    static test() {
    }
}

Main.start();