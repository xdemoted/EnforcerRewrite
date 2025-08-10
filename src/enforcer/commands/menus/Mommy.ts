import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";

class Mommy extends BaseCommand {
    public getCommand(): RESTPostAPIContextMenuApplicationCommandsJSONBody {
        return new ContextMenuCommandBuilder()
            .setName("Mommy")
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setType(ApplicationCommandType.Message)
            .toJSON();
    }

    public async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        await interaction.editReply({ content: `**${interaction.user.displayName}** ` + Main.getInstance().getRandom("mommy") + " **(mommy)**" });
    }
}

module.exports = new Mommy();