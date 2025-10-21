import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, InteractionContextType, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";
import BaseCommand from "../../../general/classes/BaseCommand";
import { Main } from "../../Main";
import MongoHandler from "src/enforcer/handlers/MongoHandler";
import UserHandler from "src/enforcer/handlers/UserHandler";
import GeneralUtils from "src/general/utils/GeneralUtils";
import { UserRating } from "src/general/classes/api/mongodb/User";

class Pass extends BaseCommand {
    public deferReply: boolean = false;
    public getCommand(): RESTPostAPIContextMenuApplicationCommandsJSONBody {
        return new ContextMenuCommandBuilder()
            .setName("Pass")
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setType(ApplicationCommandType.Message)
            .toJSON();
    }

    public async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
                    const messageID = interaction.targetId;
            const message = await interaction.channel?.messages.fetch(messageID);
    
            if (!message) {
                await interaction.reply({ content: "Could not fetch message.", ephemeral: true });
                return;
            }
    
            if (message.author.id === Main.getInstance().getClient().user?.id) {
                if (message.embeds.length == 1) {
                    let image = message.embeds[0].image?.url;
                    if (image) {
                        await interaction.deferReply({ephemeral: true});
                        MongoHandler.getInstance().getWaifuFromURL(image).then(async waifu => {
                            if (!waifu) {
                                await interaction.editReply({ content: "Could not find waifu in database."});
                                return;
                            }
    
                            const user = await UserHandler.getInstance().getUser(interaction.user.id);
                            GeneralUtils.setArray(user.stats.waifus, { id: waifu.id, rating: UserRating.PASS }, "id");
    
                            await interaction.editReply({ content: `Waifu has been put into your pass collection.`});
                            return;
                        });
                    }
                }
            }
    
            await interaction.followUp({ content: `**${interaction.user.displayName}** ` + Main.getInstance().getRandom("pass") + " **(pass)**" });
        }
}

module.exports = new Pass();