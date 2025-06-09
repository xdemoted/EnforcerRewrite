import { ObjectId } from "mongodb";

export default class GuildMember {
    constructor(
        public id: ObjectId,
        public name: string
    ) {}
}