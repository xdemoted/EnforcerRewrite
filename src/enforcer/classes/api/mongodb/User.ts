import { Document, ObjectId, WithId } from "mongodb";
import utils from "../../../utils/GeneralUtils";
import { Operator } from "../../Operator";
import GeneralUtils from "../../../utils/GeneralUtils";
import { Rating } from "../../Rating";
import Waifu from "../Waifu";
import XPProfile from "./XPProfile";
import ActiveUser from "./ActiveUser";

export default class User extends XPProfile {
    private guilds: {[key: string]: XPProfile} = {};

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
        
        if (!(user.guilds instanceof Map)) {
            user.guilds = new Map()
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
    waifus: ReducedWaifu[] = [];
}

enum UserRating {
    MOMMY = 0,
    SMASH = 1,
    PASS = 2,
    BODYBAG = 3
}

class ReducedWaifu {
    constructor(
        public url: string,
        public imageRating: Rating,
        public dominantColor: number[],
        public tags: string[],
        public userRating: UserRating
    ) { }

    static fromRandomWaifu(waifu: Waifu, userRating: UserRating): ReducedWaifu {
        return new ReducedWaifu(
            waifu.url,
            waifu.rating,
            waifu.color_dominant,
            waifu.tags,
            userRating
        );
    }
}