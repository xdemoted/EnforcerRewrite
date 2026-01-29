import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import BaseCommand from "../../general/classes/BaseCommand";

class Announce extends BaseCommand {
    public override deferReply = false;

    public titleRow = new ActionRowBuilder<TextInputBuilder>()
        .addComponents(
            new TextInputBuilder()
                .setCustomId('announceTitle')
                .setLabel("Announcement Title")
                .setStyle(1)
                .setMaxLength(256)
                .setMinLength(1)
                .setPlaceholder("Enter the title of the announcement")
                .setRequired(true)
        );
    public contentRow = new ActionRowBuilder<TextInputBuilder>()
        .addComponents(
            new TextInputBuilder()
                .setCustomId('announceContent')
                .setLabel("Announcement Content")
                .setStyle(2)
                .setMaxLength(4000)
                .setMinLength(1)
                .setPlaceholder("Enter the content of the announcement")
                .setRequired(true)
        );

    public modal = new ModalBuilder()
        .setCustomId('announceModal')
        .setTitle('Create Announcement')
        .addComponents(this.titleRow, this.contentRow);

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("announce")
            .setDescription("An announcement command")
            .setIntegrationTypes([ApplicationIntegrationType.GuildInstall,ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const channel = interaction.channel;

        interaction.showModal(this.modal);

        interaction.awaitModalSubmit({ time: 15 * 60 * 1000 })
            .then(async modalInteraction => {
                if (modalInteraction.customId !== 'announceModal') return;

                const title = modalInteraction.fields.getTextInputValue('announceTitle');
                const content = modalInteraction.fields.getTextInputValue('announceContent');
                let message;
                message = `# ${title} <:announcement:1420915936642203751>\n`

                for (let i = 0; i < title.length / 1.85; i++)
                    message += '<:line:1420913409427243068>';

                message += `\n\n${content}`;

                if (!channel?.isSendable()) {modalInteraction.reply({ content: message, ephemeral: false }); return;}

                try {
                    await channel.send({ content: message})
                    await modalInteraction.reply({ content: "Announcement created successfully!", ephemeral: true });
                } catch (error) {
                    await modalInteraction.reply({ content: message, ephemeral: false });
                }
            })
    }
}

module.exports = new Announce();