import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, Interaction } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import { Main } from "../Main";
import WaifuRandom from "../classes/api/Waifu";
import GeneralUtils, { Time } from "../utils/GeneralUtils";
import UserHandler from "../handlers/UserHandler";
import ActiveUser from "../classes/api/mongodb/ActiveUser";

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
        const user = await UserHandler.getInstance().getUser(interaction.user.id);

        let timeLeft = Time.timeLeft(user.stats.lastDaily + 18 * Time.HOUR);

        user.getDailyStreak(); // Reset daily streak if it's a new day

        if (user.stats.lastDaily == 0) {
            this.doDaily(interaction, user, 100, 200, 500, 1000, "Daily Reward");
        } else if (timeLeft.value() > 0) {
            await interaction.editReply({ content: `You can claim your daily reward in ${timeLeft.formatDuration()}.` });
        } else {
            this.doDaily(interaction, user,
                Math.round(user.stats.dailyStreak ** 1.03 * 1.5) + 30, Math.round(user.stats.dailyStreak ** 1.03) * 2 + 50, // Minimum and maximum currency
                Math.round(user.stats.dailyStreak ** 1.03) * 10 + 400, Math.round(user.stats.dailyStreak ** 1.03) * 5 + 500, // Minimum and maximum xp
            );
        }
    }

    private doDaily(interaction: CommandInteraction, user: ActiveUser, minCurrency: number, maxCurrency: number, minXP: number, maxXP: number, title?: string): void {
        user.stats.lastDaily = Date.now();

        user.stats.dailyStreak += 1;

        if (user.stats.dailyStreak > user.stats.longestDailyStreak) {
            user.stats.longestDailyStreak = user.stats.dailyStreak;
        }

        const currency = minCurrency < maxCurrency ? GeneralUtils.randomNumber(minCurrency, maxCurrency) : maxCurrency;
        const xp = minXP < maxXP ? GeneralUtils.randomNumber(minXP, maxXP) : maxXP;

        user.modifyCurrency(currency);
        user.modifyXP(xp);

        const embed = new EmbedBuilder()
            .setTitle(title ? title : "Daily Reward")
            .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} received their daily reward!`)
            .addFields(
                { name: "Currency", value: `${currency} <a:gem:1396788024934662144>`, inline: true },
                { name: "XP", value: `${xp}`, inline: true },
                { name: "Daily Streak", value: `${user.stats.dailyStreak} days`, inline: true },
                { name: "Longest Daily Streak", value: `${user.stats.longestDailyStreak} days`, inline: true }
            )
            .setColor(Colors.Green);

        interaction.editReply({ embeds: [embed] });
    }
}

module.exports = new Daily();