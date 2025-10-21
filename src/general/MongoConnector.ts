import { Collection, Db, MongoClient, WithId } from "mongodb";

export default class MongoHandler {
    private static instance: MongoHandler;
    private database?: Db;
    private collections: { [key: string]: Collection } = {};

    private constructor() {
        this.connect()
    }

    public async connect(): Promise<void> {
        const uri = process.env.DB_CONN_STRING;

        if (!uri) {
            throw new Error("MongoDB URI is not defined in environment variables.");
        }

        const client = new MongoClient(uri);
        try {
            await client.connect();
            this.database = client.db(process.env.DB_NAME);
            this.collections.users = this.database.collection("users");
            this.collections.guilds = this.database.collection("guilds");
            this.collections.waifus = this.database.collection("waifus");
            console.log("Connected to MongoDB successfully.");
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }

    public static getInstance(): MongoHandler {
        if (!MongoHandler.instance) {
            MongoHandler.instance = new MongoHandler();
        }
        return MongoHandler.instance;
    }
}