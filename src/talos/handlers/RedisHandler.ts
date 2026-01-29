import RedisConnector from "src/general/handlers/RedisConnector";
import ServerChannelHandler from "./ServerChannelHandler";
import ChatMessage from "src/general/classes/api/redis/ChatMessage";
import { BaseMessage } from "src/general/classes/api/redis/BaseMessage";

export default class RedisHandler {
    private static instance: RedisHandler;
    public client = RedisConnector.getInstance().getClient();

    constructor() {
        if (!this.client) {
            setTimeout(() => {
                this.openChannels();
            }, 5000);
        } else {
            this.openChannels();
        }
    }

    private async openChannels() {
        if (!this.client) {
            throw new Error("Redis client is not initialized.");
        }

        this.client.subscribe(["System", "ChatMessage"], (message, channel) => {
            console.log(`Received message on channel ${channel}: ${message}`);
            if (channel === "ChatMessage") {
                ServerChannelHandler.relayChatMessage(ChatMessage.fromJson(message));
            } else if (channel === "System") {
                const baseMessage = BaseMessage.fromJson(message);
                switch (baseMessage.data) {
                    case "online":
                        ServerChannelHandler.sendMessage("Server now online.", baseMessage.serverName, process.env.SERVER_ONLINE || "");
                        break;
                    case "offline":
                        ServerChannelHandler.sendMessage("Server now offline.", baseMessage.serverName, process.env.SERVER_OFFLINE || "");
                }
            }
        });
    };

    public static getInstance(): RedisHandler {
        if (!RedisHandler.instance) {
            RedisHandler.instance = new RedisHandler();
        }
        return RedisHandler.instance;
    }
}