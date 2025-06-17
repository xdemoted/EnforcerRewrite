import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import ImageURLVerify from "../utils/ImageURLVerify";
import { Main } from "../temp";
import WaifuRandom from "../classes/api/WaifuRandom";

class Activity extends BaseCommand {

    public Activity() {
    }

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("clearchat")
            .setDescription("Tag Manager")
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        let guilds: Guild[] = Main.getClient().guilds.cache.map(guild => guild);
        let message: string = "";

        while (message.length < 2000) {
            message += "# ‎\n";
        }

        interaction.reply({ content: message.substring(0, 2000) });
        return;
    }
}

module.exports = new Activity();