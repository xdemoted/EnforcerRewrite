import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, MessageFlags, Interaction } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import WaifuRandom from "../../general/classes/api/Waifu";
import UserHandler from "../handlers/UserHandler";
import GeneralUtils from "src/general/utils/GeneralUtils";

class Flip extends BaseCommand {
    private tailsURL = "http://panel.wolf-co.com:25551/tails.gif"
    private headsURL = "http://panel.wolf-co.com:25551/heads.gif";

    public override deferReply: boolean = false;

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("flip")
            .setDescription("gamble gems for a chance to double them")
            .addNumberOption(option =>
                option.setName("amount")
                    .setDescription("Amount of gems to gamble")
                    .setRequired(true)
                    .setMinValue(10)
            )
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const bet = interaction.options.get("amount")?.value as number;
        const user = await UserHandler.getInstance().getUser(interaction.user.id);

        if (bet > user.getCurrency()) {
            await interaction.reply({ content: "You don't have enough gems to gamble that amount.", flags: MessageFlags.Ephemeral });
            return;
        }

        if (!user.cds) user.cds = new Map();

        const flip = user.cds.get("flip") || 0;

        if (Date.now() < flip) {
            const timeLeft = flip - Date.now();
            const seconds = Math.ceil(timeLeft / 1000);
            await interaction.reply({ content: `You can flip again in ${seconds} seconds.`, flags: MessageFlags.Ephemeral });
            return;
        }

        user.cds.set("flip", Date.now() + 10 * 1000);

        const result = Math.random() < 0.55 ? "heads" : "tails";

        if (result === "heads") {
            user.modifyCurrency(bet);
        } else {
            user.modifyCurrency(-bet);
        }

        const embed = new EmbedBuilder()
            .setTitle("Coin Flip")
            .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} gambled ${bet} gems!`)
            .setColor(Colors.Gold)
            .setImage(result === "heads" ? this.headsURL : this.tailsURL);

        interaction.reply({ embeds: [embed] });

        setTimeout(() => {
            interaction.editReply({ content: `${GeneralUtils.getInteractDisplayName(interaction as Interaction)} flipped ${bet} gems and got ${result}! <a:${result ? "heads:1411059828264009850" : "tails:1411059876058107975"}>`, embeds: [] });
        }, 20 * 1000);
    }
}

module.exports = new Flip();