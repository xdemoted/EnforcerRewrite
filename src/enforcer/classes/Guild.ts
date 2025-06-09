import { ObjectId } from "mongodb";
import GuildMember from "./GuildMember";

export default class Guild {
    constructor(
        public id: ObjectId,
        public name: string,
        public members: Array<GuildMember>
    ) {}
}