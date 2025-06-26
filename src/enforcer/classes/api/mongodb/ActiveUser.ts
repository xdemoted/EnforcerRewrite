import { ObjectId } from "mongodb";
import User, { UserRating } from "./User";
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

    public addWaifu(waifuID: number, rating: UserRating) {
        this.setLastUpdate();
        const existingWaifu = this.stats.waifus.find(w => w.id === waifuID);

        if (existingWaifu) {
            existingWaifu.rating = rating;
            return;
        }

        this.stats.waifus.push({
            id: waifuID,
            rating: rating
        });
    }

    public static fromUser(user: User): ActiveUser {
        return Object.assign(new ActiveUser(), user);
    }

    public static toUser
}