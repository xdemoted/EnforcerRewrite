import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import ImageURLVerify from "../utils/ImageURLVerify";
import { main } from "../Main";
import WaifuRandom from "../classes/api/WaifuRandom";

class Tag extends BaseCommand {
    private validTags: string[] = ["Mavuika", "Citlali", "Esdeath", "Ryuko", "Lumine", "Eula", "Hu Tao", "Ram", "Genshin", "Honkai", "Zenless"];

    public Tag() {
        let options: StringSelectMenuOptionBuilder[] = this.validTags.map(tag => new StringSelectMenuOptionBuilder().setLabel(tag).setValue(tag.toLowerCase()));
    }

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("tag")
            .setDescription("Tag Manager")
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        let embedBuilder = new EmbedBuilder();

        embedBuilder.setTitle("Random Waifu");
        embedBuilder.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

        let rating = interaction.options.get("rating")?.value as string || "safe";
        let tag = interaction.options.get("tag")?.value as string || "girl";

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
            const response = await fetch(`https://api.nekosapi.com/v4/images/random?tags=${tag}&rating=${rating}&limit=1&without_tags=boy`);
            const waifus: WaifuRandom[] = (await response.json());

            if (waifus.length === 0) {
                await interaction.reply({ content: "No waifus found.", ephemeral: true });
                return;
            }

            [].length;
            const waifu: WaifuRandom = waifus[0];

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
        (await interaction.reply({ embeds: [embedBuilder], components: [] })).createMessageComponentCollector({ filter: i => i.isButton() && !replies.includes(i.user.id), time: 180000 }).on('collect', async i => {
            replies.push(i.user.id);
            switch (i.customId) {
                case "mommy":
                    await i.reply(`**${i.user.displayName}** ` + main.getRandom("mommy") + " **(mommy)**");
                    break;
                case "smash":
                    await i.reply(`**${i.user.displayName}** ` + main.getRandom("smash") + " **(smash)**");
                    break;
                case "bodybag":
                    await i.reply(`**${i.user.displayName}** ` + main.getRandom("bodybag") + " **(bodybag)**");
                    break;
                case "pass":
                    await i.reply(`**${i.user.displayName}** ` + main.getRandom("pass") + " **(pass)**");
                    break;
            }
        });
    }

}

module.exports = new Tag();