import { Main } from "../main";

export default class EventHandler {

    constructor(main: Main) {
        this.startMessageListener(main);
        this.startPresenceListener(main);
    }

    startMessageListener(main: Main): void {
        Main.getInstance().getClient().on('messageCreate', async (message) => {
            if (message.author.bot) return;

            // Check if the message is a command

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