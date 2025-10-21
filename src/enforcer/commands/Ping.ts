import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import UserHandler from "../handlers/UserHandler";

class Stats extends BaseCommand {

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("ping")
            .setDescription("display user stats")
            .addStringOption(option =>
                option.setName('command')
                    .setDescription('The command to get the ping for')
                    .addChoices(
                        { name: 'full setup', value: 'setup' },
                        { name: 'change roles', value: 'roles' },
                        { name: 'change times', value: 'times' }
                    )
                    .setRequired(true))
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const main = Main.getInstance();
        const user = await UserHandler.getInstance().getUser(interaction.user.id);
        const command = interaction.options.get('command')?.value as string;

        switch (command) {
            case 'setup':
                break;
            case 'roles':
                break;
            case 'times':
                break;
            default:
                await interaction.editReply({ content: "Invalid command." });
                return;
        }

        return;
    }

    public runSetup(interaction: CommandInteraction): void {
        // Implementation for setup
    }

    public runRoleSetup(interaction: CommandInteraction): void {
        const embed = new EmbedBuilder()
            .setTitle("Role Setup")
            .setColor(Colors.Green)
            .setDescription("Please select the roles you want to assign.")
            .setFooter({ text: "Role setup in progress..." });
    }

    public runTimeSetup(interaction: CommandInteraction): void {
        // Implementation for time setup
    }
}

module.exports = new Stats();