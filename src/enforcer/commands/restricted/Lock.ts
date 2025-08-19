import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";

class Lock extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("lock")
            .setDescription("Toggles bot functionality")
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const main = Main.getInstance();

        if (interaction.user.id !== '316243027423395841') {
            await interaction.editReply({ content: "You are not allowed to use this command." });
            return;
        }

        if (main.getLockdown()) {
            await interaction.editReply({ content: "The bot has been unlocked, all functionality has been restored." });
        } else {
            await interaction.editReply({ content: "The bot has been locked, all functionality has been disabled." });
        }

        main.toggleLockdown();
        return;
    }
}

module.exports = new Lock();