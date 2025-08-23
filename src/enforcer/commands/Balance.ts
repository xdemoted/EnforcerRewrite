import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import { Main } from "../Main";
import UserHandler from "../handlers/UserHandler";

class Stats extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("balance")
            .setDescription("display user balance")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const user = await UserHandler.getInstance().getUser(interaction.user.id);
        if (user.currency == 0) {
            await interaction.editReply({ content: "You a poor bitch aint cha, don't even bother asking next time. <a:gem:1396788024934662144>" });
            return;
        }
        await interaction.editReply({ content: `You have ${user.currency} gems. <a:gem:1396788024934662144>` });
        return;
    }
}

module.exports = new Stats();