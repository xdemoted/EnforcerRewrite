import { Client, Partials, REST, Routes } from "discord.js";
import BaseCommand from "./classes/BaseCommand";
import fs from "fs";
import ActivityHandler from "./stat-tracking/ActivityHandler";
import FileHandler from "./utils/FileHandler";
import EventHandler from "./handlers/EventHandler";
import MongoHandler from "./handlers/MongoHandler";

export class Main {
    private static instance: Main = new Main();

    private client: Client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User], intents: 131071 });
    private commands: BaseCommand[] = [];
    private messages = require("../resources/messages.json");
    private activityHandler: ActivityHandler = new ActivityHandler();
    private fileHandler: FileHandler = new FileHandler();
    private eventHandler?: EventHandler;
    private mongo: MongoHandler = MongoHandler.getInstance();

    private constructor() {
        require('dotenv').config({ path: "../../../.env" }); // Load environment variables
        MongoHandler.getInstance();

        if (!process.env.BOT_TOKEN) {
            console.error("No bot token provided.");
            return;
        }

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);

            this.loadCommands();
            this.registerCommands();

            this.eventHandler = new EventHandler(this);

            this.client.users.fetch("316243027423395841").then(user => {
                MongoHandler.getInstance().getUser(this.client.user as any).then((user) => {
                    user.modifyXP(100);
                    MongoHandler.getInstance().save(user);
                })
            });
            this.startCommandListener();
        });

        this.client.login(process.env.BOT_TOKEN);
    }

    getActivityHandler(): ActivityHandler {
        return this.activityHandler;
    }

    getFileHandler(): FileHandler {
        return this.fileHandler;
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

    startCommandListener() {
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
}