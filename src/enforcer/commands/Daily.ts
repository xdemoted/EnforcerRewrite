import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, Interaction } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import { Main } from "../Main";
import WaifuRandom from "../classes/api/Waifu";
import GeneralUtils from "../utils/GeneralUtils";
import UserHandler from "../handlers/UserHandler";

class Daily extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("daily")
            .setDescription("You're ministry authorized daily reward")
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        let deleteAfter = 60 * 60 * 1000; // 1 hour
        const user = await UserHandler.getInstance().getUser(interaction.user.id);
        user.getDailyStreak(); // Reset daily streak if it's a new day

        if (user.stats.lastDaily == 0) {
            user.stats.lastDaily = Date.now();

            user.stats.dailyStreak += 1;
            if (user.stats.dailyStreak > user.stats.longestDailyStreak) {
                user.stats.longestDailyStreak = user.stats.dailyStreak;
            }

            const xpReward = GeneralUtils.randomNumber(600, 1000);
            const gemsReward = GeneralUtils.randomNumber(20, 30);

            user.modifyXP(xpReward);
            user.modifyCurrency(gemsReward);

            const embedBuilder = new EmbedBuilder()
                .setTitle("First Daily Bonus")
                .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} got a starter bonus!`)
                .addFields(
                    { name: "XP Earned", value: `${xpReward}`, inline: true },
                    { name: "Gems Earned", value: `${gemsReward}`, inline: true },
                    { name: "Streak", value: `${user.stats.dailyStreak}`, inline: true },
                    { name: "Longest Streak", value: `${user.stats.longestDailyStreak}`, inline: true }
                );

            await interaction.editReply({ embeds: [embedBuilder] });
        } else if (Date.now() - user.stats.lastDaily < 18 * 60 * 60 * 1000) {
            const timeLeft = 18 * 60 * 60 * 1000 - (Date.now() - user.stats.lastDaily);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            await interaction.editReply({content:`You can claim your daily reward in ${hours}h ${minutes}m ${seconds}s.`});
            deleteAfter = 10 * 1000;
        } else {
            const xpCap = user.stats.dailyStreak * 5 + 500;
            const xpMin = user.stats.dailyStreak * 10 + 400;
            const xpReward = GeneralUtils.randomNumber(xpMin <= xpCap ? xpMin : xpCap, 500);

            const gemsCap = user.stats.dailyStreak + 3;
            const gemsReward = GeneralUtils.randomNumber(1, gemsCap);

            user.stats.lastDaily = Date.now();
            user.stats.dailyStreak += 1;
            if (user.stats.dailyStreak > user.stats.longestDailyStreak) {
                user.stats.longestDailyStreak = user.stats.dailyStreak;
            }

            user.modifyXP(xpReward);
            user.modifyCurrency(gemsReward);

            const embedBuilder = new EmbedBuilder()
                .setTitle("Daily Reward")
                .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} claimed their daily reward!`)
                .addFields(
                    { name: "XP Earned", value: `${xpReward}`, inline: true },
                    { name: "Gems Earned", value: `${gemsReward}`, inline: true },
                    { name: "Streak", value: `${user.stats.dailyStreak}`, inline: true },
                    { name: "Longest Streak", value: `${user.stats.longestDailyStreak}`, inline: true }
                )

            await interaction.editReply({ embeds: [embedBuilder] });
        }

        setTimeout(() => {
            interaction.fetchReply().then(reply => {
                if (reply.deletable) {
                    reply.delete().catch(console.error);
                }
            }).catch(console.error);
        }, deleteAfter); // Delete the reply after 1 minute
    }
}

module.exports = new Daily();