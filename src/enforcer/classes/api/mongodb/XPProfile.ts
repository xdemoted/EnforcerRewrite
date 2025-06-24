
import GeneralUtils from "../../../utils/GeneralUtils";
import { Operator } from "../../Operator";

export default class XPProfile {
    public xp: number = 0;
    public currency: number = 0;

    public getLevel(): number {
        let xp = this.xp.valueOf();
        let level = 0;

        while (xp >= GeneralUtils.getXPForLevel(level)) {
            xp -= GeneralUtils.getXPForLevel(level);
            level++;
        }

        return level;
    }

    public getXP(): number {
        return this.xp;
    }

    public modifyXP(amount: number, operator: Operator = Operator.ADD): boolean {
        const previousLevel = this.getLevel();
        this.xp = GeneralUtils.modifyNumber(this.xp, amount, operator);
        const newLevel = this.getLevel();

        if (newLevel != previousLevel) {
            return true;
        }

        return false;
    }

    public modifyCurrency(amount: number, operator: Operator = Operator.ADD) {
        this.currency = GeneralUtils.modifyNumber(this.currency, amount, operator);
    }
}