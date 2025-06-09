"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const discord_js_1 = require("discord.js");
const BaseCommand_1 = __importDefault(require("./classes/BaseCommand"));
const fs_1 = __importDefault(require("fs"));
const ActivityHandler_1 = __importDefault(require("./stat-tracking/ActivityHandler"));
const FileHandler_1 = __importDefault(require("./utils/FileHandler"));
class main {
    static start() {
        require('dotenv').config({ path: "../resources/config.env" }); // Load environment variables
        if (!process.env.BOT_TOKEN) {
            console.error("No bot token provided.");
            return;
        }
        this.client.on('ready', () => {
            var _a;
            console.log(`Logged in as ${(_a = this.client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
            this.loadCommands();
            this.registerCommands();
            console.log("The following commands are registered:");
            this.commands.forEach(command => {
                console.log(`- ${command.getCommand().name}`);
            });
            this.startCommandListener();
        });
        this.client.on('presenceUpdate', (oldPresence, presence) => {
            let member = presence === null || presence === void 0 ? void 0 : presence.member;
            if (member) {
                this.activityHandler.processMember(member);
            }
        });
        this.test();
        this.client.login(process.env.BOT_TOKEN);
    }
    static getActivityHandler() {
        return this.activityHandler;
    }
    static getFileHandler() {
        return this.fileHandler;
    }
    static getClient() {
        return this.client;
    }
    static loadCommands() {
        fs_1.default.readdirSync("./commands").forEach(file => {
            if (!file.endsWith(".js"))
                return;
            let command = require(`./commands/${file}`);
            if (command instanceof BaseCommand_1.default)
                this.commands.push(command);
        });
    }
    static registerCommands() {
        const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.BOT_TOKEN || '');
        (() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                yield rest.put(discord_js_1.Routes.applicationCommands(((_a = this.client.user) === null || _a === void 0 ? void 0 : _a.id) || ''), { body: this.commands.map(command => command.getCommand()) });
            }
            catch (error) {
                console.error(error);
            }
        }))();
    }
    static startCommandListener() {
        this.client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            const command = this.commands.find(command => command.getCommand().name === interaction.commandName);
            if (command) {
                try {
                    command.execute(interaction);
                }
                catch (error) {
                    console.error("Man this shit is fucked: " + command.getCommand().name);
                }
            }
        }));
    }
    static getRandom(key) {
        let list = this.messages[key];
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
exports.main = main;
main.client = new discord_js_1.Client({ partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction, discord_js_1.Partials.GuildMember, discord_js_1.Partials.User], intents: 131071 });
main.commands = [];
main.messages = require("../resources/messages.json");
main.activityHandler = new ActivityHandler_1.default();
main.fileHandler = new FileHandler_1.default();
main.start();
