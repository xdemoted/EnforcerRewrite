import { Collection, Db, MongoClient, WithId } from "mongodb";
import User from "../../general/classes/api/mongodb/User";
import * as discord from "discord.js";
import Waifu from "../../general/classes/api/Waifu";
import { Main } from "../Main";

export default class MongoHandler {
    private static instance: MongoHandler;
    private database?: Db;
    private collections: { [key: string]: Collection } = {};

    private constructor() {
        this.connect()
    }

    public async connect(): Promise<void> {
        const uri = Main.getVariables().DB_CONN_STRING;

        if (!uri) {
            throw new Error("MongoDB URI is not defined in environment variables.");
        }

        const client = new MongoClient(uri);
        try {
            await client.connect();
            this.database = client.db(Main.getVariables().DB_NAME);
            this.collections.users = this.database.collection("users");
            this.collections.guilds = this.database.collection("guilds");
            this.collections.waifus = this.database.collection("waifus");
            console.log("Connected to MongoDB successfully.");
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }

    public async getUser(user: discord.User): Promise<User> {
        if (!this.collections.users) {
            throw new Error("Users collection is not initialized.");
        }
        const userDoc = await this.collections.users.findOne({ userID: user.id });
        return userDoc ? User.fromDocument(userDoc) : User.create(user.displayName, user.username, user.id);
    }

    public async updateWaifu(waifu: Waifu) {
        this.collections.waifus.updateOne(
            { waifuID: waifu.id },
            { $set: waifu },
            { upsert: true }
        ).catch(error => {
            console.error("Error saving waifu:", error);
        });
    }

    public async getWaifu(waifuId: number): Promise<Waifu | null> {
        if (!this.collections.waifus) {
            throw new Error("Waifus collection is not initialized.");
        }
        const waifuDoc = await this.collections.waifus.findOne({ waifuID: waifuId });

        if (!waifuDoc) {
            return null;
        }

        return Waifu.fromDocument(waifuDoc) || null;
    }

    public async getWaifuFromURL(url: string): Promise<Waifu | null> {
        if (!this.collections.waifus) {
            throw new Error("Waifus collection is not initialized.");
        }
        return this.collections.waifus.findOne({
            url: url
        }).then(waifuDoc => {
            if (!waifuDoc) {
                return null;
            }

            return Waifu.fromDocument(waifuDoc) || null;
        });
    }

    public saveUser(document: User): void {
        if ("lastInteract" in document) {
            delete (document as any).lastInteract;
        }

        if ("lastUpdated" in document) {
            delete (document as any).lastUpdated;
        }

        if ("cds" in document) {
            delete (document as any).cds;
        }

        if (document instanceof User) {
            if (!this.collections.users) {
                throw new Error("Users collection is not initialized.");
            }

            this.collections.users.updateOne(
                { userID: document.userID },
                { $set: document },
                { upsert: true }
            ).then(() => {
                console.log(`User ${document.username} saved successfully.`);
            }).catch(error => {
                console.error("Error saving user:", error);
            });
        }
    }

    public static getInstance(): MongoHandler {
        if (!MongoHandler.instance) {
            MongoHandler.instance = new MongoHandler();
        }
        return MongoHandler.instance;
    }
}