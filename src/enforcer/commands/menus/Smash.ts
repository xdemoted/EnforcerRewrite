import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";
import BaseCommand from "../../classes/BaseCommand";
import { Main } from "../../Main";

class Smash extends BaseCommand {
    public getCommand(): RESTPostAPIContextMenuApplicationCommandsJSONBody {
        return new ContextMenuCommandBuilder()
            .setName("Smash")
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setType(ApplicationCommandType.Message)
            .toJSON();
    }

    public async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        await interaction.editReply({ content: `**${interaction.user.displayName}** ` + Main.getInstance().getRandom("smash") + " **(smash)**" });
    }
}

module.exports = new Smash();