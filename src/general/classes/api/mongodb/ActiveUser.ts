import { ObjectId } from "mongodb";
import User, { UserRating } from "./User";
import { Operator } from "../../Operator";

export default class ActiveUser extends User {
    public lastInteract = 0;
    public lastUpdated = Date.now();
    public cds: Map<string, number> = new Map();

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

    public modifyCurrency(amount: number, operator?: Operator) {
        this.setLastUpdate();
        return super.modifyCurrency(amount, operator);
    }

    public getCurrency(): number {
        this.setLastUpdate();
        return this.currency;
    }

    public getDailyStreak(): number {
        this.setLastUpdate();
        
        if (Date.now() - this.stats.lastDaily > 48 * 60 * 60 * 1000) {
            this.stats.dailyStreak = 0;
        }

        return this.stats.dailyStreak;
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
}