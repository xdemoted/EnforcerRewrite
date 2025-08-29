import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User as DiscordUser, Guild, GuildMember, ChatInputCommandInteraction, CommandInteractionOption } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";
import WaifuRandom from "../../classes/api/Waifu";
import UserHandler from "../../handlers/UserHandler";
import { Operator } from "../../classes/Operator";
import User, { stats } from "../../classes/api/mongodb/User";
import ActiveUser from "../../classes/api/mongodb/ActiveUser";

class Admin extends BaseCommand {
    private resetChoices = ["daily", "currency", "xp", "stats", "all"];

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("admin")
            .setDescription("Admin Commands")
            .addSubcommand(subcommand =>
                subcommand.setName("clearchat")
                    .setDescription("Clear the chat by spamming invisible characters")
            )
            .addSubcommand(subcommand =>
                subcommand.setName("currency")
                    .setDescription("Manage user currency")
                    .addStringOption(option =>
                        option.setName("action")
                            .setDescription("Action to perform")
                            .setRequired(true)
                            .addChoices(
                                { name: "add", value: "add" },
                                { name: "remove", value: "remove" },
                                { name: "set", value: "set" }
                            )
                    )
                    .addUserOption(option =>
                        option.setName("user")
                            .setDescription("User to modify")
                            .setRequired(true)
                    )
                    .addIntegerOption(option =>
                        option.setName("amount")
                            .setDescription("Amount to modify by")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName("reset")
                    .setDescription("Broadcast a message to all guilds")
                    .addStringOption(option =>
                        option.setName("data")
                            .setDescription("Data to reset")
                            .addChoices(
                                ...this.resetChoices.map(choice => ({ name: choice, value: choice }))
                            )
                            .setRequired(true)
                    )
                    .addUserOption(option =>
                        option.setName("user")
                            .setDescription("User to reset data for")
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName("sendservermessage")
                    .setDescription("Send a message used for user setup")
                    .addStringOption(option =>
                        option.setName("message")
                            .setDescription("Message to broadcast")
                            .addChoices(
                                { name: "Ping Setup", value: "ping" }
                            )
                    )
            )
            .addSubcommandGroup(subcommand =>
                subcommand.setName("lockdown")
                    .setDescription("Broadcast a message to all guilds")
                    .addSubcommand(sub =>
                        sub.setName("toggle")
                            .setDescription("Toggle lockdown mode")
                    )
                    .addSubcommand(sub =>
                        sub.setName("status")
                            .setDescription("Check lockdown status")
                    )
                    .addSubcommand(sub =>
                        sub.setName("adduser")
                            .setDescription("Add a user to the lockdown whitelist")
                            .addStringOption(option =>
                                option.setName("user")
                                    .setDescription("User to add")
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand(sub =>
                        sub.setName("removeuser")
                            .setDescription("Remove a user from the lockdown whitelist")
                            .addStringOption(option =>
                                option.setName("user")
                                    .setDescription("User to remove")
                                    .setRequired(true)
                            )
                    )
            )
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setDefaultMemberPermissions(0)
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const subcommand = (interaction as ChatInputCommandInteraction).options.getSubcommand();

        switch (subcommand) {
            case "clearchat":
                this.clearChat(interaction);
                break;
            case "currency":
                this.manageCurrency(interaction);
                break;
            case "reset":
                this.resetData(interaction);
                break;
            case "sendservermessage":
            case "toggle":
            case "status":
            case "adduser":
            case "removeuser":
                this.manageLockdown(interaction, subcommand);
                break;
            default:
                await interaction.editReply({ content: "Invalid subcommand." });
                break;
        }
    }

    public clearChat(interaction: CommandInteraction): void {
        let message: string = "";

        while (message.length < 2000) {
            message += "# ‎\n";
        }

        interaction.editReply({ content: message.substring(0, 2000) });
        return;
    }

    public manageCurrency(interaction: CommandInteraction): void {
        const action = (interaction as ChatInputCommandInteraction).options.getString("action", true);
        const discordUser = (interaction as ChatInputCommandInteraction).options.getUser("user", true);
        const amount = (interaction as ChatInputCommandInteraction).options.getInteger("amount", true);

        if (!["add", "remove", "set"].includes(action)) {
            interaction.editReply({ content: "Invalid action. Must be one of: add, remove, set." });
            return;
        }

        if (amount < 0) {
            interaction.editReply({ content: "Amount must be a positive integer." });
            return;
        }

        UserHandler.getInstance().getUser(discordUser.id).then(user => {
            if (!user) {
                interaction.editReply({ content: "User not found." });
                return;
            }

            switch (action) {
                case "add":
                    user.modifyCurrency(amount);
                    interaction.editReply({ content: `Added ${amount} gems to <@${discordUser.id}>. They now have ${user.getCurrency()} gems.` });
                    break;
                case "remove":
                    user.modifyCurrency(amount, Operator.SUBTRACT);
                    interaction.editReply({ content: `Removed ${amount} gems from <@${discordUser.id}>. They now have ${user.getCurrency()} gems.` });
                    break;
                case "set":
                    user.modifyCurrency(amount, Operator.SET);
                    interaction.editReply({ content: `Set <@${discordUser.id}>'s gems to ${amount}.` });
                    break;
            }
        }).catch(err => {
            console.error(err);
            interaction.editReply({ content: "An error occurred while fetching the user." });
        });
    }

    public resetData(interaction: CommandInteraction): void {
        const main = Main.getInstance();
        let options: (CommandInteractionOption | null)[] = [interaction.options.get("data"), interaction.options.get("user")];
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
    }

    public manageLockdown(interaction: CommandInteraction, subcommand: string): void {
        switch (subcommand) {
            case "toggle":
                Main.getInstance().toggleLockdown();

                interaction.editReply({ content: `Lockdown mode is now \`${Main.getInstance().getLockdown() ? "enabled" : "disabled"}.\`` });
                break;
            case "status":
                interaction.editReply({ content: `Lockdown mode is currently \`${Main.getInstance().getLockdown() ? "enabled" : "disabled"}.\`` });
                break;
            case "adduser": {
                const user = interaction.options.get("user")?.user;

                if (!user) {
                    interaction.editReply({ content: "No user specified." });
                    return;
                }

                if (Main.getInstance().getAllowedUsers().includes(user.id)) {
                    interaction.editReply({ content: `User \`${user.username}\` already has bot access.` });
                    return;
                }

                interaction.editReply({ content: `User \`${user.username}\` now has bot access.` });
                Main.getInstance().addAllowedUser(user.id);
            }
                break;
            case "removeuser": {
                const user = interaction.options.get("user")?.user;

                if (!user) {
                    interaction.editReply({ content: "No user specified." });
                    return;
                }

                if (Main.getInstance().getAllowedUsers().includes(user.id)) {
                    interaction.editReply({ content: `User \`${user.username}\` no longer has bot access.` });
                    Main.getInstance().removeAllowedUser(user.id);
                    return;
                }

                interaction.editReply({ content: `User \`${user.username}\` does not have bot access.` });
            }
                break;
        }
    }
}

module.exports = new Admin();