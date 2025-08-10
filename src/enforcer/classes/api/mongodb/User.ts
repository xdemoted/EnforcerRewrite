import { Document, ObjectId, WithId } from "mongodb";
import utils from "../../../utils/GeneralUtils";
import { Operator } from "../../Operator";
import GeneralUtils from "../../../utils/GeneralUtils";
import { Rating } from "../../Rating";
import Waifu from "../Waifu";
import XPProfile from "./XPProfile";
import ActiveUser from "./ActiveUser";

export default class User extends XPProfile {
    public guilds: Map<string, XPProfile> = new Map();

    public stats: stats = new stats();

    public displayname: string = "";
    public username: string = "";
    public userID: string = "";
    public _id: ObjectId = new ObjectId()

    public getGuildProfile(guildID: string): XPProfile {
        if (!this.guilds.has(guildID)) {
            this.guilds.set(guildID, new XPProfile());
        }
        
        return this.guilds.get(guildID)!;
    }

    static fromDocument(document: WithId<Document>): User {
        let user = Object.assign(new User(), document);

        user.guilds = new Map<string, XPProfile>();
        user.stats = Object.assign(new stats(), document.stats || {});

        for (const [key, value] of Object.entries(document.guilds || {})) {
            user.guilds.set(key, Object.assign(new XPProfile(), value));
        }

        return user
    }

    static create(displayname: string, username: string, userID: string): User {
        let user = new User();
        user.displayname = displayname;
        user.username = username;
        user.userID = userID;
        user.xp = 0;
        return user;
    }
}

class stats {
    totalMessages: number = 0;
    commandsSent: number = 0;
    gamesWon: number = 0;
    lastDaily: number = 0;
    dailyStreak: number = 0;
    longestDailyStreak: number = 0;
    waifus: WaifuRating[] = [];
}

export enum UserRating {
    MOMMY = 0,
    SMASH = 1,
    PASS = 2,
    BODYBAG = 3
}

export class WaifuRating {
    public id: number;
    public rating: UserRating;

    constructor(waifuID: number, rating: UserRating) {
        this.id = waifuID;
        this.rating = rating;
    }
}