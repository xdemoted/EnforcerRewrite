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
const discord_js_1 = require("discord.js");
const BaseCommand_1 = __importDefault(require("../classes/BaseCommand"));
const Main_1 = require("../Main");
class Activity extends BaseCommand_1.default {
    Activity() {
    }
    getCommand() {
        return new discord_js_1.SlashCommandBuilder()
            .setName("clearchat")
            .setDescription("Tag Manager")
            .setIntegrationTypes([discord_js_1.ApplicationIntegrationType.UserInstall])
            .setContexts([discord_js_1.InteractionContextType.PrivateChannel, discord_js_1.InteractionContextType.Guild])
            .toJSON();
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let guilds = Main_1.main.getClient().guilds.cache.map(guild => guild);
            let message = "";
            while (message.length < 2000) {
                message += "# ‎\n";
            }
            interaction.reply({ content: message.substring(0, 2000) });
            return;
        });
    }
}
module.exports = new Activity();
