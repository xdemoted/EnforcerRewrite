import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import { Main } from "../main";
import WaifuRandom from "../classes/api/Waifu";
import ActivityMethods, { UserActivity } from "../utils/ActivityMethods";

class Activity extends BaseCommand {
    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("activity")
            .setDescription("Tag Manager")
            .addStringOption(option =>
                option.setName("user")
                    .setDescription("User to get activity from")
                    .setRequired(false)
            )
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();

        let activities = Main.getInstance().getActivityHandler()

        console.log(activities.songs);
        //console.log(activities.users);
        activities.users.forEach(user => {
            console.log(user);
        });

        let id: string = (interaction.options.get("user")?.value as string);

        let message: string = "";

        if (!id) {
            console.log("No user specified, getting all activities.");
            ActivityMethods.getAllActivity().then(async (userActivities) => {
                for (const userActivity of userActivities) {
                    const activities = userActivity.activities.map(activity => activity.name).join(", ");
                    const activityMessage = `${userActivity.user.displayName} is doing: ${activities || "nothing"}\n`;
                    if (message.length + activityMessage.length < 2000) {
                        message += activityMessage;
                    } else {
                        await interaction.followUp({ content: message });
                        message = activityMessage;
                    }
                }
                if (message.length > 0) {
                    await interaction.followUp({ content: message });
                } else {
                    await interaction.followUp({ content: "No activities found." });
                }

                interaction.editReply({ content: "Logged to console." });
            });
        } else {
            console.log("User specified, getting activity for user: " + id);
            let userActivity:UserActivity|null = await ActivityMethods.getActivity(id);
            if (userActivity) {
                const activities = userActivity.activities.map(activity => activity.name).join(", ");
                message += `${userActivity.user.displayName} is doing: ${activities || "nothing"}`;
                interaction.editReply({embeds: [userActivity.toEmbed()]});
                ActivityMethods.logActivity(userActivity);
                return;
            } else {
                message += "No activities found.";
            }

            if (message.length > 0) {
                await interaction.followUp({ content: message });
            } else {
                await interaction.followUp({ content: "No activities found." });
            }
        }
    }
}

module.exports = new Activity();