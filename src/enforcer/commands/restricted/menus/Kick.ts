import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, RESTPostAPIContextMenuApplicationCommandsJSONBody, ContextMenuCommandInteraction } from "discord.js";
import BaseCommand from "src/enforcer/classes/BaseCommand";
import { Main } from "src/enforcer/Main";
import ActivityMethods, { UserActivity } from "src/enforcer/utils/ActivityMethods";

class Activity extends BaseCommand {
    public getCommand(): RESTPostAPIContextMenuApplicationCommandsJSONBody {
        return new ContextMenuCommandBuilder()
            .setName("kick")
            .setDefaultMemberPermissions(0) // Requires admin permissions
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.Guild])
            .setType(ApplicationCommandType.User)
            .toJSON();
    }

    public async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.editReply({ content: "This command can only be used in a guild." });
            return;
        }

        const member = interaction.options.get("user")?.member;

        if (!member||!(member instanceof GuildMember)) {
            await interaction.editReply({ content: "User not found." });
            return;
        }

        if (!member.kickable) {
            await interaction.editReply({ content: "Bot cannot kick this user." });
            return;
        }

        const highestRole = (interaction.member as GuildMember).roles.highest;
        const targetHighestRole = member.roles.highest;

        if (highestRole.position <= targetHighestRole.position) {
            await interaction.editReply({ content: "You cannot kick this user because they have a higher or equal role." });
            return;
        }

        await member.ban({ reason: `Kicked by ${interaction.user.tag} for reason: Not Provided` });

        const embed = new EmbedBuilder()
            .setTitle("User Kicked")
            .setDescription(`**User:** ${member.user.tag}\n**Kicked by:** ${interaction.user.tag}\n**Reason:** Not Provided`)
            .setColor(0xff0000)
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        return;
    }
}

module.exports = new Activity();