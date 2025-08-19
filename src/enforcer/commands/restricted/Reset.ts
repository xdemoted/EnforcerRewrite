import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User as DiscordUser, Guild, GuildMember, CommandInteractionOption } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";
import UserHandler from "../../handlers/UserHandler";
import { stats } from "../../classes/api/mongodb/User";
import User from "../../classes/api/mongodb/User";
import ActiveUser from "../../classes/api/mongodb/ActiveUser";

class ToggleUserAccess extends BaseCommand {
    private choices = [ "daily", "currency", "xp", "stats", "all" ];

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("reset")
            .setDescription("Reset specific data for a user")
            .addStringOption(option =>
                option.setName("data")
                    .setDescription("Data to reset")
                    .addChoices(
                        ...this.choices.map(choice => ({ name: choice, value: choice }))
                    )
                    .setRequired(true)
            )
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("User to reset data for")
                    .setRequired(false)
            )
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const main = Main.getInstance();
        let options: (CommandInteractionOption|null)[] = [interaction.options.get("data"), interaction.options.get("user")];
        let data = options[0]?.value as string;
        let user: DiscordUser | null = options[1]?.user || interaction.user;

        UserHandler.getInstance().getUser(user.id).then(async (userData) => {
            switch (data) {
                case "daily":
                    userData.stats.lastDaily = 0;
                    userData.stats.dailyStreak = 0;
                    await interaction.editReply({ content: `Daily reset for ${user.username}.` });
                    break;
                case "currency":
                    userData.currency = 0;
                    await interaction.editReply({ content: `Currency reset for ${user.username}.` });
                    break;
                case "xp":
                    userData.xp = 0;
                    await interaction.editReply({ content: `XP reset for ${user.username}.` });
                    break;
                case "stats":
                    userData.stats = new stats();
                    await interaction.editReply({ content: `Stats reset for ${user.username}.` });
                    break;
                case "all":
                    userData = ActiveUser.fromUser(User.create(user.displayName, user.username, user.id));
                    await interaction.editReply({ content: `All data reset for ${user.username}.` });
                    break;
                default:
                    await interaction.editReply({ content: "Invalid data type specified." });
                    return;
            }
        })

        return;
    }
}

module.exports = new ToggleUserAccess();