import { Message, MessageFlags } from "discord.js";
import {GenericBot} from "src/general/classes/GenericBot";

export default class EventHandler {

    constructor(main: GenericBot) {
        this.startMessageListener(main);
        this.startCommandListener(main);
    }

    startCommandListener(main: GenericBot) {
        main.getClient().on('interactionCreate', async interaction => {
            console.log("Received")
            if (main.getLockdown()&&!main.getAllowedUsers().includes(interaction.user.id)&& !interaction.isAutocomplete()) {
                await interaction.reply({ content: "The bot has been locked by a Ministry official, interaction has been forbidden.", flags: MessageFlags.Ephemeral });
                return;
            }

            if (!interaction.isCommand()) return;

            const command = main.getCommands().find(command => command.getCommand().name === interaction.commandName);

            if (command) {
                try {
                    if (command.restricted && interaction.user.id !== '316243027423395841') {
                        await interaction.reply({ content: "You are not allowed to use this command.", ephemeral: true });
                        return;
                    }

                    if (command.deferReply) await interaction.deferReply();

                    command.execute(interaction);

                    /* TODO Reenable XP system
                    UserHandler.getInstance().getUser(interaction.user.id).then(user => {
                        UserHandler.getInstance().giveInteractXP(interaction,user);
                        user.stats.commandsSent += 1;
                    });
                    */
                } catch (error) {
                    console.error("Man this shit is fucked: " + command.getCommand().name)
                }
            }
        });
    }

    startMessageListener(main: GenericBot): void {
        main.getClient().on('messageCreate', (message) => {
            if (main.getLockdown()&&!main.getAllowedUsers().includes(message.author.id)) return;

        });
    }
}