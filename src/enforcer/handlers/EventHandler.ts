import { Message, MessageFlags } from "discord.js";
import { Main } from "../Main";
import UserHandler from "./UserHandler";
import GeneralUtils from "../utils/GeneralUtils";

export default class EventHandler {

    constructor(main: Main) {
        this.startMessageListener(main);
        this.startPresenceListener(main);
        this.startCommandListener(main);
    }

    startCommandListener(main: Main) {
        main.getClient().on('interactionCreate', async interaction => {
            if (main.getLockdown()&&!main.getAllowedUsers().includes(interaction.user.id)&& !interaction.isAutocomplete()) {
                await interaction.reply({ content: "The bot has been locked by a Ministry official, interaction has been forbidden.", flags: MessageFlags.Ephemeral });
                return;
            }

            if (!interaction.isCommand()) return;

            const command = main.getCommands().find(command => command.getCommand().name === interaction.commandName);

            if (command) {
                try {
                    if (command.deferReply) await interaction.deferReply();

                    command.execute(interaction);

                    UserHandler.getInstance().getUser(interaction.user.id).then(user => {
                        UserHandler.getInstance().giveInteractXP(interaction,user);
                        user.stats.commandsSent += 1;
                    });
                } catch (error) {
                    console.error("Man this shit is fucked: " + command.getCommand().name)
                }
            }
        });
    }

    startMessageListener(main: Main): void {
        Main.getInstance().getClient().on('messageCreate', (message) => {
            if (main.getLockdown()&&!main.getAllowedUsers().includes(message.author.id)) return;

            UserHandler.getInstance().getUser(message.author.id).then(user => {
                UserHandler.getInstance().giveInteractXP(message, user);
                user.stats.totalMessages += 1
            })
        });
    }

    startPresenceListener(main: Main): void {
        main.getClient().on('presenceUpdate', (oldPresence, presence) => {
            if (main.getLockdown()&&!main.getAllowedUsers().includes(presence.userId)) return;

            console.log(`Presence update for user: ${presence.userId}`);
            let member = presence?.member
            if (member) {
                main.getActivityHandler().processMember(member);
            }
        });
    }
}