import { Document, ObjectId, WithId } from "mongodb";
import utils from "../../../utils/GeneralUtils";
import { Operator } from "../../Operator";
import GeneralUtils from "../../../utils/GeneralUtils";
import { Rating } from "../../Rating";
import Waifu from "../Waifu";
import XPProfile from "./XPProfile";
import ActiveUser from "./ActiveUser";

export default class User extends XPProfile {
    public guilds: {[key: string]: XPProfile} = {};
    public guildsMap: Map<string, XPProfile> = new Map();

    public stats: stats = new stats();

    public displayname: string = "";
    public username: string = "";
    public userID: string = "";
    public _id: ObjectId = new ObjectId()

    public getGuildProfile(guildID: string): XPProfile {
        if (!this.guildsMap.has(guildID)) {
            this.guildsMap.set(guildID, new XPProfile());
        }

        return this.guildsMap.get(guildID)!;
    }

    static fromDocument(document: WithId<Document>): User {
        let user = Object.assign(new User(), document);

        for (const [key, value] of Object.entries(document.guilds || {})) {
            user.guildsMap.set(key, Object.assign(new XPProfile(), value));
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