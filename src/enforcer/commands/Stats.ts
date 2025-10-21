import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import UserHandler from "../handlers/UserHandler";

class Stats extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("stats")
            .setDescription("display user stats")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const main = Main.getInstance();
        const user = await UserHandler.getInstance().getUser(interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle("User Stats")
            .setColor(Colors.Blue)
            .setDescription(`**Username:** ${interaction.user.username}\n**Account Created:** ${interaction.user.createdAt.toLocaleDateString()}`)
            .addFields(
                { name: "Total Commands Used", value: `${user.stats.commandsSent}`, inline: true },
                { name: "Total Messages Sent", value: `${user.stats.totalMessages}`, inline: true },
                { name: "Total XP", value: `${user.xp}`, inline: true },
                { name: "Total Gems", value: `${user.currency}`, inline: true },
                { name: "Daily Streak", value: `${user.stats.dailyStreak}`, inline: true },
                { name: "Longest Daily Streak", value: `${user.stats.longestDailyStreak}`, inline: true },
                { name: "Last Daily Reward", value: user.stats.lastDaily ? new Date(user.stats.lastDaily).toLocaleString() : "Never" }
            )
            .setThumbnail(interaction.user.displayAvatarURL());

        await interaction.editReply({ embeds: [embed] });
        return;
    }
}

module.exports = new Stats();