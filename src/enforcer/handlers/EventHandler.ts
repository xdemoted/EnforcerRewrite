import { Message } from "discord.js";
import { Main } from "../main";

export default class EventHandler {

    constructor(main: Main) {
        this.startMessageListener(main);
        this.startPresenceListener(main);
    }

    startMessageListener(main: Main): void {
        Main.getInstance().getClient().on('messageCreate', async (message) => {
            if (message.author.bot) return;
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

    giveMessageXP(message: Message<boolean>) {
        if (message.channel.isTextBased()&&message.content.length > 5) {
            let user = message.author;
            if (user.bot) return;

            let xp = Math.floor(Math.random() * 10) + 5; // Random XP between 5 and 15
            let mongoHandler = Main.getInstance().getMongoHandler();

            mongoHandler.getUser(user).then((userData) => {
                userData.modifyXP(xp);
                mongoHandler.save(userData);
            }).catch((error) => {
                console.error("Error saving user XP:", error);
            });
        }
    }
}