import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import { Main } from "../Main";
import UserHandler from "../handlers/UserHandler";
import nodeHtmlToImage from "node-html-to-image";
import fs from "fs";
import GeneralUtils from "../utils/GeneralUtils";

class Level extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("level")
            .setDescription("Display your level card.")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const user = await UserHandler.getInstance().getUser(interaction.user.id);
        const discordUser = interaction.user;
        let levelCard = await nodeHtmlToImage({
          html: fs.readFileSync('./web/level.html', 'utf8'),
          selector: 'body > div',
          content: {
            username: discordUser.displayName,
            level_card_bg: "https://files.catbox.moe/fzx1xz.png",
            avatar_url: discordUser.displayAvatarURL({ size: 1024, extension: 'webp' }),
            level: user.getLevel(),
            xp: user.getLevelProgress(),
            xp_required: GeneralUtils.getXPForLevel(user.getLevel() + 1)
          },
          puppeteerArgs: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']}
        });

        
        levelCard = Array.isArray(levelCard) ? levelCard[0] : levelCard;

        interaction.editReply({ files: [{ attachment: levelCard, name: 'level_card.png' }] });
        return;
    }
}

module.exports = new Level();