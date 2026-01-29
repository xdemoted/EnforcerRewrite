import { Main } from "../Main";

export class MessageHandler {
    private static instance: MessageHandler;
    private main: Main = Main.getInstance();

    constructor() {
        //this.startMessageEnforcement();
    }

    public startMessageEnforcement() {
        this.main.getClient().on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if (message.guildId != "917476736223043604") return;

            if (!message.content.toLowerCase().includes("milk")) {
                message.delete().catch(err => {
                    console.error("Failed to delete message:", err);
                });
            }
        })
    }

    public static getInstance(): MessageHandler {
        if (!MessageHandler.instance) {
            MessageHandler.instance = new MessageHandler();
        }
        return MessageHandler.instance;
    }
}