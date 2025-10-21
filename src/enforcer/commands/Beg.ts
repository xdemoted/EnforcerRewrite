import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import UserHandler from "../handlers/UserHandler";
import GeneralUtils from "src/general/utils/GeneralUtils";

class Beg extends BaseCommand {
    earnings: Map<string, number> = new Map();

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("beg")
            .setDescription("beg on your hands and knees for gems")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const user = await UserHandler.getInstance().getUser(interaction.user.id);
        const threshold = user.currency < 200 ? (3*Math.sin((Math.PI/200) * user.currency + Math.PI / 2))/8 + 0.375 : 0;
        if (Math.random() > threshold) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("You beg to a heartless void, but it gives you nothing in return.");
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        let earnings;

        if (this.earnings.has(interaction.user.id)) {
            earnings = this.earnings.get(interaction.user.id) as number;
        } else {
            this.earnings.set(interaction.user.id, 0);
            earnings = 0;
        }

        if (earnings >= 100) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("The void has wasted its time with you, and it refuses to give you any more gems.");
            await interaction.editReply({ embeds: [embed] });
        } else {
            const minAmount = Math.floor(Math.random() * 10) + 1;
            const maxAmount = 100 - earnings > 25 ? 25 : 100 - earnings;

            const amount = GeneralUtils.randomNumber(minAmount, maxAmount);

            this.earnings.set(interaction.user.id, earnings + amount);
            user.modifyCurrency(amount);

            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setDescription(`The void is generous and it gives you **${amount}** gems! You now have **${user.getCurrency()}** gems.`);

            await interaction.editReply({ embeds: [embed] });
        }

        return;
    }
}

module.exports = new Beg();