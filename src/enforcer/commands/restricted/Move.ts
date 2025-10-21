import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder, VoiceChannel } from "discord.js";
import BaseCommand from "src/general/classes/BaseCommand";
import { Main } from "src/enforcer/Main";

class Activity extends BaseCommand {
    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("move")
            .setDescription("Move users to another voice channel")
            .addChannelOption(option =>
                option.setName("channel")
                    .setDescription("User to kick")
                    .addChannelTypes(2) // Voice channel type
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(0) // Requires admin permissions
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const channel = interaction.options.get("channel")?.channel;

        if (!channel || channel.type !== 2) {
            await interaction.editReply({ content: "Channel not found or is not a voice channel." });
            return;
        }

        const member = interaction.member;

        if (!member || !(member instanceof GuildMember)) {
            await interaction.editReply({ content: "Member not found." });
            return;
        }

        let startChannel = member.voice.channel;

        if (!startChannel) {
            await interaction.editReply({ content: "You are not in a voice channel." });
            return;
        }

        try {
            startChannel.members.forEach(async (m) => {
                await m.voice.setChannel(channel as VoiceChannel);
            });
        } catch (e) {
            interaction.editReply({ content: "Failed to move users. Ensure the bot has the necessary permissions." });
            return;
        }
    }
}

module.exports = new Activity();