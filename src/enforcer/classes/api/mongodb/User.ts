import { ObjectId } from "mongodb";
import utils from "../../../utils/GeneralUtils";

export default class User {
    public xp: number = 0;

    constructor(
        public displayname: string,
        public username: string,
        public userID: string,
        public id?: ObjectId
    ) {}

    public getLevel(): number {
        let xp = this.xp.valueOf();
        let level = 0;

        while (xp >= utils.getXPForLevel(level)) {
            xp -= utils.getXPForLevel(level);
            level++;
        }

        return level;
    }
}