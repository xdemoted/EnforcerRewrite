import { ObjectId } from "mongodb";
import User from "./User";
import { Operator } from "../../Operator";

export default class ActiveUser extends User {
    public lastInteract = 0;
    public lastUpdated = Date.now();

    public setLastInteract() {
        this.lastInteract = Date.now();
    }

    public setLastUpdate() {
        this.lastUpdated = Date.now();
    }

    public modifyXP(amount: number, operator?: Operator) {
        this.setLastUpdate();
        return super.modifyXP(amount, operator);
    }

    public static fromUser(user: User): ActiveUser {
        return Object.assign(new ActiveUser(), user);
    }
}