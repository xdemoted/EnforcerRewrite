import { Message } from "discord.js";
import { Main } from "../main";
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
            if (!interaction.isCommand()) return;

            const command = main.getCommands().find(command => command.getCommand().name === interaction.commandName);

            if (command) {
                try {
                    command.execute(interaction);
                    UserHandler.getInstance().giveInteractXP(interaction);
                } catch (error) {
                    console.error("Man this shit is fucked: " + command.getCommand().name)
                }
            }
        });
    }

    startMessageListener(main: Main): void {
        Main.getInstance().getClient().on('messageCreate', async (message) => {
            UserHandler.getInstance().giveInteractXP(message)
        });
    }

    startPresenceListener(main: Main): void {
        main.getClient().on('presenceUpdate', (oldPresence, presence) => {
            console.log(`Presence update for user: ${presence.userId}`);
            let member = presence?.member
            if (member) {
                main.getActivityHandler().processMember(member);
            }
        });
    }
}