import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Singleton } from "src/container/Singleton";

@Singleton
export class SearchMap extends BaseCommand {
    public override deferReply = false;

    private maps: Record<string, string> = require("src/talos/classes/maps.json")

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("searchmap")
            .setDescription("A map search command")
            .addStringOption(option => option.setName("query").setDescription("The map to search for").setRequired(true))
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const channel = interaction.channel;
        const query: string = interaction.options.get("query", true).value as string;

        let results: Map<string, string> = new Map();
        for (const key in this.maps) {
            if (key.toLowerCase().includes(query.toLowerCase())) {
                results.set(key, this.maps[key]);
            }
        }

        if (results.size === 0) {
            await interaction.reply({ content: "Map not found. Please check your spelling and try again.", ephemeral: true });
            return;
        }

        if (results.size == 1) {
            interaction.reply({ content: `Map \`${results.keys().next()}\` has code \`${results.values().next()}\`` })
        } else {
            let lines = "";
            for (const [key, value] of results) {
                lines += `\`${key}\` - \`${value}\`\n`;
            }
            interaction.reply({ content: `Multiple maps found:\n${lines}` });
        }
    }
}