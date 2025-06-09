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
const MainT_1 = require("../MainT");
class Tag extends BaseCommand_1.default {
    constructor() {
        super(...arguments);
        this.validTags = ["Mavuika", "Citlali", "Esdeath", "Ryuko", "Lumine", "Eula", "Hu Tao", "Ram", "Genshin", "Honkai", "Zenless"];
    }
    Tag() {
        let options = this.validTags.map(tag => new discord_js_1.StringSelectMenuOptionBuilder().setLabel(tag).setValue(tag.toLowerCase()));
    }
    getCommand() {
        return new discord_js_1.SlashCommandBuilder()
            .setName("tag")
            .setDescription("Tag Manager")
            .setIntegrationTypes([discord_js_1.ApplicationIntegrationType.UserInstall])
            .setContexts([discord_js_1.InteractionContextType.PrivateChannel, discord_js_1.InteractionContextType.Guild])
            .toJSON();
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let embedBuilder = new discord_js_1.EmbedBuilder();
            embedBuilder.setTitle("Random Waifu");
            embedBuilder.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
            let rating = ((_a = interaction.options.get("rating")) === null || _a === void 0 ? void 0 : _a.value) || "safe";
            let tag = ((_b = interaction.options.get("tag")) === null || _b === void 0 ? void 0 : _b.value) || "girl";
            /*if (url && url.length > 10) {
                const result = await ImageURLVerify.verify(url);
    
                if (typeof result === "string") {
                    await interaction.reply({ content: result, ephemeral: true });
                    return;
                }
    
                embedBuilder.setImage(url);
                embedBuilder.setColor(Colors.Blurple);
            */
            try {
                //const response = await fetch('https://api.waifu.im/search?included_tags=waifu');
                const response = yield fetch(`https://api.nekosapi.com/v4/images/random?tags=${tag}&rating=${rating}&limit=1&without_tags=boy`);
                const waifus = (yield response.json());
                if (waifus.length === 0) {
                    yield interaction.reply({ content: "No waifus found.", ephemeral: true });
                    return;
                }
                [].length;
                const waifu = waifus[0];
                embedBuilder.setImage(waifu.url);
                embedBuilder.setFooter({ text: `Rating: ${waifu.rating} | Tags: ${waifu.tags.join(", ")}` });
                if (waifu.artist_name)
                    embedBuilder.setDescription("Artist: " + waifu.artist_name);
                if (waifu.source)
                    embedBuilder.setURL(waifu.source);
                embedBuilder.setColor((waifu.color_dominant[0] << 16) + (waifu.color_dominant[1] << 8) + waifu.color_dominant[2]);
            }
            catch (error) {
                console.error(error);
                return;
            }
            let replies = [];
            (yield interaction.reply({ embeds: [embedBuilder], components: [] })).createMessageComponentCollector({ filter: i => i.isButton() && !replies.includes(i.user.id), time: 180000 }).on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                replies.push(i.user.id);
                switch (i.customId) {
                    case "mommy":
                        yield i.reply(`**${i.user.displayName}** ` + MainT_1.main.getRandom("mommy") + " **(mommy)**");
                        break;
                    case "smash":
                        yield i.reply(`**${i.user.displayName}** ` + MainT_1.main.getRandom("smash") + " **(smash)**");
                        break;
                    case "bodybag":
                        yield i.reply(`**${i.user.displayName}** ` + MainT_1.main.getRandom("bodybag") + " **(bodybag)**");
                        break;
                    case "pass":
                        yield i.reply(`**${i.user.displayName}** ` + MainT_1.main.getRandom("pass") + " **(pass)**");
                        break;
                }
            }));
        });
    }
}
module.exports = new Tag();
