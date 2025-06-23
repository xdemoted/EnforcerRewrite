import { Document, ObjectId, WithId } from "mongodb";
import utils from "../../../utils/GeneralUtils";
import { Operator } from "../../Operator";
import GeneralUtils from "../../../utils/GeneralUtils";
import { Rating } from "../../Rating";

export default class User {
    private xp: number = 0;

    constructor(
        public displayname: string,
        public username: string,
        public userID: string,
        public _id: ObjectId = new ObjectId()
    ) { }

    public getLevel(): number {
        let xp = this.xp.valueOf();
        let level = 0;

        while (xp >= utils.getXPForLevel(level)) {
            xp -= utils.getXPForLevel(level);
            level++;
        }

        return level;
    }

    public modifyXP(amount: number, operator: Operator = Operator.ADD): void {
        GeneralUtils.modifyNumber(this.xp, amount, operator);
    }

    static fromDocument(document: WithId<Document>): User {
        let user = new User("", "", "", document._id);
        return Object.assign(user, document);
    }
}

class stats {
    totalMessages: number = 0;
    commandsSent: number = 0;
    gamesWon: number = 0;
    waifus: {
        [key: string]: {
            url: string,
            imageRating: Rating,
            dominantColor: number[],
            tags: string[],
            userRating: "mommy" | "smash" | "pass" | "bodybag"
        }
    } = {};
}

class waifus {
    public url: string
    public imageRating: Rating
    public dominantColor: number[]
    public tags: string[]
    public userRating: "mommy" | "smash" | "pass" | "bodybag"

    constructor(
        url: string,
        imageRating: Rating,
        dominantColor: number[],
        tags: string[],
        userRating: "mommy" | "smash" | "pass" | "bodybag"
    ) {
        this.url = url;
        this.imageRating = imageRating;
        this.dominantColor = dominantColor;
        this.tags = tags;
        this.userRating = userRating;
    }
}