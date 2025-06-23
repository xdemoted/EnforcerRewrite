import ActiveUser from "../classes/api/mongodb/ActiveUser";
import User from "../classes/api/mongodb/User";
import MongoHandler from "./MongoHandler";

export default class DataHandler {
    private static instance: DataHandler;
    private users: Map<string, ActiveUser> = new Map();

    private constructor() { }

    public initUserUpdate(userID: string): ActiveUser {
        if (this.users.has(userID)) {
            const user = this.users.get(userID) as ActiveUser;
            user.lastUpdate = Date.now();
            return user;
        } else {
            return new ActiveUser(
                "Unknown",
                "Unknown",
                userID
            );
        }

    }

    public addXP(userID: string, amount: number): void {
        const user = this.users.get(userID);
        
    } 

    public static getInstance(): DataHandler {
        if (!DataHandler.instance) {
            DataHandler.instance = new DataHandler();
        }
        return DataHandler.instance;
    }
}