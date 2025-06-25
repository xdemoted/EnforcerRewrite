import { BaseInteraction, Interaction, Message } from "discord.js";
import ActiveUser from "../classes/api/mongodb/ActiveUser";
import { Main } from "../main";
import GeneralUtils from "../utils/GeneralUtils";
import MongoHandler from "./MongoHandler";

export default class UserHandler {
    private static instance: UserHandler;
    private users: Map<string, ActiveUser> = new Map();

    constructor() {
        this.startUserSaveInterval();
    }

    async getUser(userID: string): Promise<ActiveUser> {
        if (this.users.has(userID)) {
            return Promise.resolve(this.users.get(userID)!);
        } else {
            try {
                const user_1 = await Main.getInstance().getClient().users.fetch(userID);
                const userData = await MongoHandler.getInstance().getUser(user_1);
                this.users.set(userID, ActiveUser.fromUser(userData));
                return this.users.get(userID)!;
            } catch (error) {
                console.error(`Error fetching user ${userID}:`, error);
                throw new Error(`User with ID ${userID} not found.`);
            }
        }
    }

    giveInteractXP(interact: Message<boolean> | Interaction) {
        let user;
        const guild = interact.guild;
        if (interact instanceof Message) {
            if (interact.channel.isTextBased() && interact.content.length > 5) {
                user = interact.author;
            } else return;
        } else if (interact instanceof BaseInteraction) {
            if (interact.isCommand() || interact.isButton()) {
                user = interact.user;
            } else return;
        } else return;

        if (user.bot) return;

        UserHandler.getInstance().getUser(user.id).then((userData) => {
            if (GeneralUtils.timeSince(userData.lastInteract) > 60000) { // 1 minute cooldown
                userData.setLastInteract();

                if (userData.modifyXP(GeneralUtils.randomNumber(5, 25))) {
                    userData.modifyCurrency(GeneralUtils.randomNumber(1, 3));
                }

                if (guild) {
                    const guildProfile = userData.getGuildProfile(guild.id);
                    if (guildProfile.modifyXP(GeneralUtils.randomNumber(5, 25))) {
                        guildProfile.modifyCurrency(GeneralUtils.randomNumber(5, 10));
                    }
                }                    
            }
        })
    }

    startUserSaveInterval(): void {
        setInterval(() => {
            this.users.forEach((user, userID) => {
                MongoHandler.getInstance().saveUser(user);

                if (GeneralUtils.timeSince(user.lastUpdated) > 600000) { // Delete users not updated in the last 10 minutes
                    this.users.delete(userID);
                }
            });
        }, 10000); // Save every 5 minutes
    }

    public static getInstance(): UserHandler {
        if (!UserHandler.instance) {
            UserHandler.instance = new UserHandler();
        }
        return UserHandler.instance;
    }
}