import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";

class ToggleUserAccess extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("tua")
            .setDescription("Toggles user access")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("User to toggle access for")
                    .setRequired(true)
            )
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const main = Main.getInstance();
        const user = interaction.options.get("user")?.user;

        if (interaction.user.id !== '316243027423395841') {
            await interaction.editReply({ content: "You are not allowed to use this command." });
            return;
        }

        if (!user) {
            await interaction.editReply({ content: "No user specified." });
            return;
        }

        if (main.getAllowedUsers().includes(user.id)) {
            main.removeAllowedUser(user.id);
            await interaction.editReply({ content: `User \`${user.displayName}\` no longer has bot access.` });
        } else {
            main.addAllowedUser(user.id);
            await interaction.editReply({ content: `User \`${user.displayName}\` now has bot access.` });
        }
        return;
    }
}

module.exports = new ToggleUserAccess();