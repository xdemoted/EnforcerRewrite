import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";
import WaifuRandom from "../../classes/api/Waifu";

class ClearChat extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("clearchat")
            .setDescription("Tag Manager")
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        let guilds: Guild[] = Main.getInstance().getClient().guilds.cache.map(guild => guild);
        let message: string = "";

        while (message.length < 2000) {
            message += "# ‎\n";
        }

        interaction.editReply({ content: message.substring(0, 2000) });
        return;
    }
}

module.exports = new ClearChat();