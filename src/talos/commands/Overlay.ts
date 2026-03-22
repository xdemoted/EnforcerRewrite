import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";
import { Singleton } from "src/container/Singleton";
import { OverlayManager } from "../modules/OverlayManager";

@Singleton
export class Overlay extends BaseCommand {
    public override deferReply = false;
    private overlayManager: OverlayManager;

    private pointsMap: Map<string, number> = new Map([
        ["1", 15],
        ["2", 12],
        ["3", 10],
        ["4", 9],
        ["5", 8],
        ["6", 7],
        ["7", 6],
        ["8", 5],
        ["9", 4],
        ["10", 3],
        ["11", 2],
        ["12", 1]
    ]);

    private setupModal: ModalBuilder = new ModalBuilder()
        .setCustomId("overlay_setup_modal")
        .setTitle("Overlay Setup")
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("team1Name")
                    .setLabel("Team 1 Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("team1Logo")
                    .setLabel("Team 1 Logo URL")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("team2Name")
                    .setLabel("Team 2 Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("team2Logo")
                    .setLabel("Team 2 Logo URL")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            )
        );

    private updateModal: ModalBuilder = new ModalBuilder()
        .setCustomId("overlay_update_modal")
        .setTitle("Overlay Update")
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("team1Score")
                    .setLabel("Team 1 Score (Comma separated rankings)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("setTeam1Score")
                    .setLabel("Set Team 1 Score (leave blank)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("setTeam2Score")
                    .setLabel("Set Team 2 Score (leave blank)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId("setRound")
                    .setLabel("Set Round (will increment by default)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            )
        );


    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("overlay")
            .setDescription("Overlay management command")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .addStringOption(
                option =>
                    option.setName("action")
                        .setDescription("The action to perform on the overlay")
                        .setRequired(true)
                        .setChoices(
                            { name: "create", value: "create" },
                            { name: "update", value: "update" },
                            { name: "delete", value: "delete" },
                        )
            )
            .toJSON();
    }

    constructor(overlayManager: OverlayManager) {
        super();
        this.overlayManager = overlayManager;
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const action = interaction.options.get("action", true).value as string;

        switch (action) {
            case "create": {
                await this.handleCreate(interaction);
            }
                break;
            case "update":
                await this.handleUpdate(interaction);
                break;
            case "delete":
                // Handle overlay deletion
                await interaction.reply("Overlay deleted!");
                break;
            default:
                await interaction.reply("Invalid action specified.");
        }
    }

    public async handleCreate(interaction: ButtonInteraction | CommandInteraction, bypassWarning = false) {
        const overlay = this.overlayManager.getOverlay(interaction.user.id);

        if (overlay && !bypassWarning) {
            const warningEmbed = new EmbedBuilder()
                .setTitle("Existing Overlay Detected")
                .setDescription("You already have an active overlay. Creating a new one will overwrite the existing overlay. Do you want to proceed?")
                .setColor(Colors.Yellow);
            const confirmButton = new ButtonBuilder()
                .setCustomId("confirm_create")
                .setLabel("Yes, create new overlay")
                .setStyle(ButtonStyle.Danger);
            console.log("warning")
            interaction.reply({ embeds: [warningEmbed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton)], ephemeral: true });

            const filter = (i: Interaction) => i.isButton() && i.customId === "confirm_create" && i.user.id === interaction.user.id;
            const collector = interaction.channel?.createMessageComponentCollector({ filter: filter, time: 15000 });
            collector?.on("collect", async (i: ButtonInteraction) => {
                this.handleCreate(i, true);
            });

            return;
        }
        console.log("modal")
        await interaction.showModal(this.setupModal);
        interaction.awaitModalSubmit({ time: 15 * 60 * 1000 })
            .then(async modalInteraction => {
                if (modalInteraction.customId !== "overlay_setup_modal") return;
                const team1Name = modalInteraction.fields.getTextInputValue("team1Name");
                let team1Logo = modalInteraction.fields.getTextInputValue("team1Logo");
                const team2Name = modalInteraction.fields.getTextInputValue("team2Name");
                let team2Logo = modalInteraction.fields.getTextInputValue("team2Logo");

                if (!team1Logo) {
                    team1Logo = "/placeholder.png";
                }

                if (!team2Logo) {
                    team2Logo = "/placeholder.png";
                }

                const team1 = { name: team1Name, logoURL: team1Logo, score: 0 };
                const team2 = { name: team2Name, logoURL: team2Logo, score: 0 };

                const overlay = this.overlayManager.createOverlay(interaction.user.id, [team1, team2]);

                const embed = new EmbedBuilder()
                    .setTitle("Overlay Created")
                    .setDescription(`URL: ` + `${process.env.URL_PREFIX}/overlay?userId=${overlay.createdBy}`)
                    .setColor(Colors.Green);
                await modalInteraction.reply({ embeds: [embed], ephemeral: true });
            })
            .catch(async () => {
                console.log("timeout")
                await interaction.followUp({ content: "Overlay setup timed out. Please try again.", ephemeral: true });
            });
    }

    public async handleUpdate(interaction: CommandInteraction) {
        const overlay = this.overlayManager.getOverlay(interaction.user.id);

        if (!overlay) {
            await interaction.reply({ content: "No active overlay found to update.", ephemeral: true });
            return;
        }

        await interaction.showModal(this.updateModal);
        interaction.awaitModalSubmit({ time: 15 * 60 * 1000 })
            .then(async modalInteraction => {
                if (modalInteraction.customId !== "overlay_update_modal") return;
                const team1PlacementsInput = modalInteraction.fields.getTextInputValue("team1Score").trim();
                const setTeam1ScoreInput = modalInteraction.fields.getTextInputValue("setTeam1Score").trim();
                const setTeam2ScoreInput = modalInteraction.fields.getTextInputValue("setTeam2Score").trim();
                const setRoundInput = modalInteraction.fields.getTextInputValue("setRound").trim();

                let team1Score = overlay.teams[0].score;
                let team2Score = overlay.teams[1].score;

                if (setTeam1ScoreInput || setTeam2ScoreInput) {
                    if (setTeam1ScoreInput) {
                        const parsedTeam1Score = Number.parseInt(setTeam1ScoreInput, 10);
                        if (Number.isNaN(parsedTeam1Score)) {
                            await modalInteraction.reply({ content: "Team 1 set score must be a number.", ephemeral: true });
                            return;
                        }
                        team1Score = parsedTeam1Score;
                    }

                    if (setTeam2ScoreInput) {
                        const parsedTeam2Score = Number.parseInt(setTeam2ScoreInput, 10);
                        if (Number.isNaN(parsedTeam2Score)) {
                            await modalInteraction.reply({ content: "Team 2 set score must be a number.", ephemeral: true });
                            return;
                        }
                        team2Score = parsedTeam2Score;
                    }
                } else if (team1PlacementsInput) {
                    const team1Placements = team1PlacementsInput
                        .split(",")
                        .map(value => value.trim())
                        .filter(Boolean);

                    if (team1Placements.length !== 6) {
                        await modalInteraction.reply({ content: "Team 1 placements must contain exactly 6 comma-separated places.", ephemeral: true });
                        return;
                    }

                    const uniquePlacements = new Set(team1Placements);
                    if (uniquePlacements.size !== 6) {
                        await modalInteraction.reply({ content: "Team 1 placements must not contain duplicates.", ephemeral: true });
                        return;
                    }

                    const isValidPlacement = team1Placements.every(place => this.pointsMap.has(place));
                    if (!isValidPlacement) {
                        await modalInteraction.reply({ content: "Placements must be numbers from 1 to 12.", ephemeral: true });
                        return;
                    }

                    const allPlacements = Array.from({ length: 12 }, (_, index) => String(index + 1));
                    const team2Placements = allPlacements.filter(place => !uniquePlacements.has(place));

                    const team1RoundScore = team1Placements.reduce((sum, place) => sum + (this.pointsMap.get(place) ?? 0), 0);
                    const team2RoundScore = team2Placements.reduce((sum, place) => sum + (this.pointsMap.get(place) ?? 0), 0);

                    team1Score += team1RoundScore;
                    team2Score += team2RoundScore;
                }

                if (setRoundInput) {
                    const parsedRound = Number.parseInt(setRoundInput, 10);
                    if (Number.isNaN(parsedRound) || parsedRound < 1) {
                        await modalInteraction.reply({ content: "Round must be a positive number.", ephemeral: true });
                        return;
                    }
                } else {
                    overlay.round += 1;
                }

                const success = this.overlayManager.updateOverlay(interaction.user.id, team1Score, team2Score);

                if (success) {
                    await modalInteraction.reply({ content: "Overlay updated successfully!", ephemeral: true });
                } else {
                    await modalInteraction.reply({ content: "Failed to update overlay. Please try again.", ephemeral: true });
                }
            })
            .catch(async () => {
                await interaction.followUp({ content: "Overlay update timed out. Please try again.", ephemeral: true });
            });
    }
}