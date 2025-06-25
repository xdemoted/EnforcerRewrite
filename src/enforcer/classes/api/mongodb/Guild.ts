import { ObjectId } from "mongodb";

export default class Guild {
    constructor(
        public id: ObjectId,
        public name: string
    ) {}
}