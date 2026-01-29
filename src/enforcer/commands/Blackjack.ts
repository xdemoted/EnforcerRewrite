import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, MessageFlags, Interaction, MessageComponentInteraction } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Main } from "../Main";
import WaifuRandom from "../../general/classes/api/Waifu";
import UserHandler from "../handlers/UserHandler";
import GeneralUtils from "src/general/utils/GeneralUtils";
import axios from "axios";

class Flip extends BaseCommand {
    private tailsURL = "https://files.catbox.moe/mfnic9.gif"
    private headsURL = "https://files.catbox.moe/ev0osf.gif";

    public override deferReply: boolean = false;

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("blackjack")
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
        let ended = false;
        const bet = interaction.options.get("amount")?.value as number;
        const user = await UserHandler.getInstance().getUser(interaction.user.id);

        if (bet > user.getCurrency()) {
            await interaction.reply({ content: "You don't have enough gems to gamble that amount.", flags: MessageFlags.Ephemeral });
            return;
        }

        if (!user.cds) user.cds = new Map();

        const blackjack = user.cds.get("blackjack") || 0;

        if (Date.now() < blackjack) {
            const timeLeft = blackjack - Date.now();
            const seconds = Math.ceil(timeLeft / 1000);
            await interaction.reply({ content: `You can play again in ${seconds} seconds.`, flags: MessageFlags.Ephemeral });
            return;
        }

        user.cds.set("blackjack", Date.now() + 10 * 1000);

        let deck = [];
        let playerHand: number[] = [];
        let dealerHand: number[] = [];

        for (let i = 0; i < 52; i++) {
            deck.push(i % 13) + 1;
        }

        console.log("Deck before shuffle: ", deck);

        GeneralUtils.shuffleArray(deck);

        playerHand.push(deck.pop() as number);
        dealerHand.push(deck.pop() as number);
        playerHand.push(deck.pop() as number);
        dealerHand.push(deck.pop() as number);

        if (this.getHandValue(playerHand) === 21) {
            if (this.getHandValue(dealerHand) === 21) {
                const embed = new EmbedBuilder()
                    .setTitle("Blackjack")
                    .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} gambled ${bet} gems!`)
                    .setColor(Colors.Gold)
                    .setFields(
                        { name: "Your Hand", value: `${this.displayCardArray(playerHand)}`, inline: true },
                        { name: "Dealer's Hand", value: `${this.displayCardArray(dealerHand)}`, inline: true },
                    );
                await interaction.reply({ content: `Both you and the dealer have blackjack! It's a tie! No gems lost or gained.`, embeds: [embed], components: [] });
            } else {
                user.modifyCurrency(Math.round(bet * 1.5));
                const embed = new EmbedBuilder()
                    .setTitle("Blackjack")
                    .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} gambled ${bet} gems!`)
                    .setColor(Colors.Gold)
                    .setFields(
                        { name: "Your Hand", value: `${this.displayCardArray(playerHand)}`, inline: true },
                        { name: "Dealer's Hand", value: `${this.displayCardArray(dealerHand)} and ?`, inline: true },
                    );
                await interaction.reply({ content: `Blackjack! You win! Gained ${bet} gems.`, embeds: [embed], components: [] });
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("Blackjack")
            .setDescription(`${GeneralUtils.getInteractDisplayName(interaction as Interaction)} gambled ${bet} gems!`)
            .setColor(Colors.Gold)
            .setFields(
                { name: "Your Hand", value: `${this.displayCardArray(playerHand)}`, inline: true },
                { name: "Dealer's Hand", value: `${this.getCardName(dealerHand[0])} and ?`, inline: true },
            );
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("hit")
                    .setLabel("Hit")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("stand")
                    .setLabel("Stand")
                    .setStyle(ButtonStyle.Secondary)
            );

        interaction.reply({ embeds: [embed], components: [row] });
        const reply = await interaction.fetchReply();
        const collector = reply.createMessageComponentCollector({ time: 10 * 60 * 1000, filter: (i: MessageComponentInteraction) => i.user.id === interaction.user.id })
        collector.on("collect", async (i: MessageComponentInteraction) => {
            if (i.customId === "hit") {
                playerHand.push(deck.pop() as number);
                const playerValue = this.getHandValue(playerHand);
                const dealerValue = this.getHandValue(dealerHand);

                if (playerValue > 21) {
                    user.modifyCurrency(-bet);
                    embed.setColor(Colors.Red);
                    embed.setFields(
                        { name: "Your Hand", value: `${this.displayCardArray(playerHand)}`, inline: true },
                        { name: "Dealer's Hand", value: `${this.displayCardArray(dealerHand)}`, inline: true },
                    );
                    await i.update({ content: `${GeneralUtils.getInteractDisplayName(interaction as Interaction)} busted! Lost ${bet} gems.`, embeds: [embed], components: [] });
                    ended = true;
                    collector.stop();
                } else {
                    embed.setFields(
                        { name: "Your Hand", value: `${this.displayCardArray(playerHand)}`, inline: true },
                        { name: "Dealer's Hand", value: `${this.getCardName(dealerHand[0])} and ?`, inline: true },
                    );

                    await i.update({ embeds: [embed] });
                }
            } else if (i.customId === "stand") {
                while (this.getHandValue(dealerHand) < 17) {
                    dealerHand.push(deck.pop() as number);
                }
                const dealerValue = this.getHandValue(dealerHand);
                const playerValue = this.getHandValue(playerHand);

                embed.setFields(
                    { name: "Your Hand", value: `${this.displayCardArray(playerHand)}`, inline: true },
                    { name: "Dealer's Hand", value: `${this.displayCardArray(dealerHand)}`, inline: true },
                );

                if (dealerValue > 21 || playerValue > dealerValue) {
                    embed.setColor(Colors.Green);
                    user.modifyCurrency(bet);
                    await i.update({ content: `${GeneralUtils.getInteractDisplayName(interaction as Interaction)} wins! Gained ${bet} gems.`, embeds: [embed], components: [] });
                } else if (playerValue < dealerValue) {
                    embed.setColor(Colors.Red);
                    user.modifyCurrency(-bet);
                    await i.update({ content: `${GeneralUtils.getInteractDisplayName(interaction as Interaction)} lost! Lost ${bet} gems.`, embeds: [embed], components: [] });
                } else {
                    await i.update({ content: `${GeneralUtils.getInteractDisplayName(interaction as Interaction)} tied! No gems lost or gained.`, embeds: [embed], components: [] });
                }
                ended = true;
                collector.stop();
            }
        });

        collector.on("end", async () => {
            if (!ended) {
                await interaction.editReply({ content: `Blackjack game ended due to timeout. Lost ${bet} gems.`, embeds: [], components: [] });
            }
        });
    }

    getCardValue(card: number): number {
        if (card + 1 > 10) return 10; // J, Q, K are worth 10
        return card + 1; // Aces are worth 1 or 11, handled later
    }

    getCardName(card: number): string {
        const names = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
        return names[card];
    }

    getHandValue(hand: number[]): number {
        let value = 0;
        let aces = 0;

        for (const card of hand) {
            if (card === 0) {
                aces++;
                value += 11;
            } else {
                value += this.getCardValue(card);
            }
        }

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    displayCardArray(array: number[]): string {
        return array.map(card => this.getCardName(card)).join(", ");
    }
}

module.exports = new Flip();