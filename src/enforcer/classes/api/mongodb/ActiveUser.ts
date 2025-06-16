import { ObjectId } from "mongodb";
import User from "./User";

export default class ActiveUser extends User {
    public lastMessage = 0;

    constructor(
        displayname: string,
        username: string,
        userID: string,
        id?: ObjectId
    ) {
        super(displayname, username, userID, id);
    }
}