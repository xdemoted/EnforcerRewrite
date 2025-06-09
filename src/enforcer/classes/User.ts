import { ObjectId } from "mongodb";

export default class User {
    constructor(
        public id: ObjectId,
        public name: string,
        public role: string
    ) {}
}