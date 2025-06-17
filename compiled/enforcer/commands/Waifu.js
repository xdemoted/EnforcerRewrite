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
class Waifu extends BaseCommand_1.default {
    constructor() {
        super(...arguments);
        this.row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId('mommy').setLabel('Mommy?').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId('smash').setLabel('Smash').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId('pass').setLabel('Pass').setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder().setCustomId('bodybag').setLabel('Bodybag').setStyle(discord_js_1.ButtonStyle.Secondary));
    }
    getCommand() {
        return new discord_js_1.SlashCommandBuilder()
            .setName("waifu")
            .setDescription("Get a random waifu image.")
            .setIntegrationTypes([discord_js_1.ApplicationIntegrationType.UserInstall])
            .setContexts([discord_js_1.InteractionContextType.PrivateChannel, discord_js_1.InteractionContextType.Guild])
            .addStringOption(option => option.setChoices(["safe", "suggestive", "borderline", "explicit"].map(rating => ({ name: rating, value: rating }))).setName("rating").setDescription("The rating of the image."))
            .addStringOption(option => option.setName("tag").setDescription("The tag of the image.").setRequired(false))
            .toJSON();
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            interaction.deferReply();
            let embedBuilder = new discord_js_1.EmbedBuilder();
            if (interaction.channelId == "1328978895738765373" || interaction.channelId == "858439510425337926" && Math.random() < 0.1) {
                embedBuilder.setTitle("Connection Terminated");
                embedBuilder.setDescription(require("../../resources/speech.txt").replace(/%user%/g, interaction.user.username));
                yield interaction.editReply({ embeds: [embedBuilder] });
                return;
            }
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
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                (yield interaction.editReply({ embeds: [embedBuilder], components: [this.row] })).createMessageComponentCollector({ filter: i => i.isButton() && !replies.includes(i.user.id), time: 180000 }).on('collect', (i) => __awaiter(this, void 0, void 0, function* () {
                    replies.push(i.user.id);
                    switch (i.customId) {
                        case "mommy":
                            yield i.reply(`**${i.user.displayName}** ` + Main_1.main.getRandom("mommy") + " **(mommy)**");
                            break;
                        case "smash":
                            yield i.reply(`**${i.user.displayName}** ` + Main_1.main.getRandom("smash") + " **(smash)**");
                            break;
                        case "bodybag":
                            yield i.reply(`**${i.user.displayName}** ` + Main_1.main.getRandom("bodybag") + " **(bodybag)**");
                            break;
                        case "pass":
                            yield i.reply(`**${i.user.displayName}** ` + Main_1.main.getRandom("pass") + " **(pass)**");
                            break;
                    }
                }));
            }), 250);
        });
    }
}
module.exports = new Waifu();
