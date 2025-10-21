import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, GuildMember, Guild } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import fs from "fs";
import RandomWaifu from "../../general/classes/api/Waifu";
import UserHandler from "../handlers/UserHandler";
import { UserRating } from "../../general/classes/api/mongodb/User";
import MongoHandler from "../handlers/MongoHandler";

class Waifu extends BaseCommand {
    private row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('mommy').setLabel('Mommy?').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('smash').setLabel('Smash').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('pass').setLabel('Pass').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('bodybag').setLabel('Bodybag').setStyle(ButtonStyle.Secondary)
    );

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("waifu")
            .setDescription("Get a random waifu image.")
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .addStringOption(option => option.setChoices(["safe", "suggestive", "borderline", "explicit"].map(rating => ({ name: rating, value: rating }))).setName("rating").setDescription("The rating of the image."))
            .addStringOption(option => option.setName("tag").setDescription("The tag of the image.").setRequired(false))
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        let embedBuilder = new EmbedBuilder();

        var num = Math.random();
        console.log(num);
        if ((interaction.channelId == "1328978895738765373" || interaction.channelId == "858439510425337926") && (num < 0.005)) {
            embedBuilder.setTitle("ランダムなワイフ");
            embedBuilder.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
            embedBuilder.setImage("https://files.catbox.moe/y1fezu.gif");
            embedBuilder.setFooter({ text: `評価: 秘密 | タグ: メイド` });
            let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('mommy').setLabel('Mommy?').setStyle(ButtonStyle.Success).setDisabled(true),
                new ButtonBuilder().setCustomId('smash').setLabel('Smash').setStyle(ButtonStyle.Primary).setDisabled(true),
                new ButtonBuilder().setCustomId('pass').setLabel('Pass').setStyle(ButtonStyle.Danger).setDisabled(true),
                new ButtonBuilder().setCustomId('bodybag').setLabel('Bodybag').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );
            interaction.editReply({ embeds: [embedBuilder], components: [row] }).then(() => {
                setTimeout(async () => {
                    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder().setCustomId('secret').setLabel('Unauthorized Access').setStyle(ButtonStyle.Danger)
                    );
                    embedBuilder = new EmbedBuilder();
                    embedBuilder.setTitle("Connection Terminated");
                    const speech = fs.readFileSync("../resources/speech.txt").toString().replace(/%name%/g, interaction.user.displayName);
                    embedBuilder.setDescription(speech);
                    (await interaction.editReply({ embeds: [embedBuilder], components: [row] })).createMessageComponentCollector({ filter: i => i.isButton(), time: 60000 }).on('collect', async i => {
                        let member = i.member
                        let role = i.guild?.roles.cache.get('1384649452027117618')

                        if (member instanceof GuildMember && i.guild?.id == '917476736223043604' && role) {
                            member.roles.add(role)
                            i.reply({ ephemeral: true, content: "Granted Unauthorized Access." })
                        }
                    })
                    embedBuilder = new EmbedBuilder();
                    setTimeout(() => {
                        embedBuilder.setTitle("Disabled Waifu");
                        embedBuilder.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
                        embedBuilder.setImage("https://files.catbox.moe/xlcf5j.webp");
                        embedBuilder.setFooter({ text: `Tags: Balls | Rating: Explicitly Safe` });
                        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder().setCustomId('mommy').setLabel('Mommy?').setStyle(ButtonStyle.Success).setDisabled(true),
                            new ButtonBuilder().setCustomId('smash').setLabel('Smash').setStyle(ButtonStyle.Primary).setDisabled(true),
                            new ButtonBuilder().setCustomId('pass').setLabel('Pass').setStyle(ButtonStyle.Danger).setDisabled(true),
                            new ButtonBuilder().setCustomId('bodybag').setLabel('Bodybag').setStyle(ButtonStyle.Secondary).setDisabled(true)
                        );
                        interaction.editReply({ embeds: [embedBuilder], components: [row] })
                    }, 60000)
                }, 3000);
            })
            return;
        }

        embedBuilder.setTitle("Random Waifu");
        embedBuilder.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        let rating = interaction.options.get("rating")?.value as string || "safe";
        let tag = interaction.options.get("tag")?.value as string || "girl";
        let waifu: RandomWaifu;

        try {
            const response = await fetch(`https://api.nekosapi.com/v4/images/random?tags=${tag}&rating=${rating}&limit=1&without_tags=boy`);
            const waifus: RandomWaifu[] = (await response.json());

            if (waifus.length === 0) {
                await interaction.reply({ content: "No waifus found.", ephemeral: true });
                return;
            }

            waifu = waifus[0];

            MongoHandler.getInstance().updateWaifu(waifu);

            embedBuilder.setImage(waifu.url);
            embedBuilder.setFooter({ text: `Rating: ${waifu.rating} | Tags: ${waifu.tags.join(", ")}` });
            if (waifu.artist_name) embedBuilder.setDescription("Artist: " + waifu.artist_name);
            if (waifu.source) embedBuilder.setURL(waifu.source);
            embedBuilder.setColor((waifu.color_dominant[0] << 16) + (waifu.color_dominant[1] << 8) + waifu.color_dominant[2]);
        } catch (error) {
            console.error(error);
            return;
        }

        let replies: string[] = [];
        (await interaction.editReply({ embeds: [embedBuilder], components: [this.row] })).createMessageComponentCollector({ filter: i => i.isButton() && !replies.includes(i.user.id), time: 180000 }).on('collect', async i => {
            replies.push(i.user.id);
            let userRating: UserRating;
            switch (i.customId) {
                case "mommy":
                    await i.reply(`**${i.user.displayName}** ` + Main.getInstance().getRandom("mommy") + " **(mommy)**");
                    userRating = UserRating.MOMMY;
                    break;
                case "smash":
                    await i.reply(`**${i.user.displayName}** ` + Main.getInstance().getRandom("smash") + " **(smash)**");
                    userRating = UserRating.SMASH;
                    break;
                case "bodybag":
                    await i.reply(`**${i.user.displayName}** ` + Main.getInstance().getRandom("bodybag") + " **(bodybag)**");
                    userRating = UserRating.BODYBAG;
                    break;
                case "pass":
                    await i.reply(`**${i.user.displayName}** ` + Main.getInstance().getRandom("pass") + " **(pass)**");
                    userRating = UserRating.PASS;
                    break;
            }

            if (waifu) {
                UserHandler.getInstance().getUser(i.user.id).then(async (user) => {
                    user.addWaifu(waifu.id, userRating);
                    user.setLastUpdate();
                })
            }
        });
    }

}

module.exports = new Waifu();