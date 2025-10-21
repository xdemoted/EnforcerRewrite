import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import BaseCommand from "src/general/classes/BaseCommand";
import { Main } from "src/enforcer/Main";

class Activity extends BaseCommand {
    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("timeout")
            .setDescription("Timeout another user")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("User to timeout")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("time")
                    .setDescription("How long to timeout the user for (e.g. 10m, 1h, 1d, 3mo)")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("Reason for timeout")
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

        if (!member || !(member instanceof GuildMember)) {
            await interaction.editReply({ content: "User not found." });
            return;
        }

        if (!member.bannable) {
            await interaction.editReply({ content: "Bot cannot timeout this user." });
            return;
        }

        const highestRole = (interaction.member as GuildMember).roles.highest;
        const targetHighestRole = member.roles.highest;

        if (highestRole.position <= targetHighestRole.position) {
            await interaction.editReply({ content: "You cannot timeout this user because they have a higher or equal role." });
            return;
        }

        const reason = interaction.options.get("reason")?.value as string;

        await member.ban({ reason: `Timeout by ${interaction.user.tag} for reason: ${reason}` });

        const embed = new EmbedBuilder()
            .setTitle("User Timeout")
            .setDescription(`**User:** ${member.user.tag}\n**Timeout by:** ${interaction.user.tag}\n**Reason:** ${reason}`)
            .setColor(0xff0000)
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    public getTime(time: string): number {
        const timeValue = parseInt(time.slice(0, -1));
        const timeUnit = time.slice(-1);

        switch (timeUnit) {
            case 'm':
                return timeValue * 60 * 1000;
            case 'h':
                return timeValue * 60 * 60 * 1000;
            case 'd':
                return timeValue * 24 * 60 * 60 * 1000;
            case 'w':
                return timeValue * 7 * 24 * 60 * 60 * 1000;
            case 'mo':
                return timeValue * 30 * 24 * 60 * 60 * 1000;
            case 'y':
                return timeValue * 365 * 24 * 60 * 60 * 1000;
            default:
                return parseInt(time) * 1000; // assume seconds if no unit
        }
    }
}

module.exports = new Activity();