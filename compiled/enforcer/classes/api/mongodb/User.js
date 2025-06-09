"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GeneralUtils_1 = __importDefault(require("../../../utils/GeneralUtils"));
class User {
    constructor(displayname, username, userID, id) {
        this.displayname = displayname;
        this.username = username;
        this.userID = userID;
        this.id = id;
        this.xp = 0;
    }
    getLevel() {
        let xp = this.xp.valueOf();
        let level = 0;
        while (xp >= GeneralUtils_1.default.getXPForLevel(level)) {
            xp -= GeneralUtils_1.default.getXPForLevel(level);
            level++;
        }
        return level;
    }
}
exports.default = User;
