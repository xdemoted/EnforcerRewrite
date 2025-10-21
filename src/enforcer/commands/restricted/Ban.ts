import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import BaseCommand from "src/general/classes/BaseCommand";
import { Main } from "src/enforcer/Main";

class Activity extends BaseCommand {
    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("ban")
            .setDescription("Ban another user")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("User to ban")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("Reason for ban")
                    .setMinLength(5)
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(0) // Requires admin permissions
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
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

        if (!member.bannable) {
            await interaction.editReply({ content: "Bot cannot ban this user." });
            return;
        }

        const highestRole = (interaction.member as GuildMember).roles.highest;
        const targetHighestRole = member.roles.highest;

        if (highestRole.position <= targetHighestRole.position) {
            await interaction.editReply({ content: "You cannot ban this user because they have a higher or equal role." });
            return;
        }

        const reason = interaction.options.get("reason")?.value as string;

        await member.ban({ reason: `Banned by ${interaction.user.tag} for reason: ${reason}` });

        const embed = new EmbedBuilder()
            .setTitle("User Banned")
            .setDescription(`**User:** ${member.user.tag}\n**Banned by:** ${interaction.user.tag}\n**Reason:** ${reason}`)
            .setColor(0xff0000)
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        return;
    }
}

module.exports = new Activity();