"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivity = void 0;
const discord_js_1 = require("discord.js");
const Main_1 = require("../Main");
class UserActivity {
    constructor(user) {
        var _a;
        this.user = user;
        this.activities = ((_a = user.presence) === null || _a === void 0 ? void 0 : _a.activities) || [];
    }
    toEmbed() {
        let status = null;
        for (const activity of this.activities) {
            if (activity.name === 'Custom Status') {
                status = activity.state;
                this.activities.splice(this.activities.indexOf(activity), 1);
                break;
            }
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: this.user.displayName
        })
            .setColor(0x00AE86)
            .setTitle(status || "No Custom Status")
            .setFields(this.activities.map(activity => {
            var _a;
            return ({
                name: (activity.name == "Spotify" ? (activity.details || "unknown song") : activity.name),
                value: activity.name == "Spotify" ? (activity.state || "unknown song") : `${new Date(Date.now() - (((_a = activity.timestamps) === null || _a === void 0 ? void 0 : _a.start) ? activity.timestamps.start.getTime() : 0)).toISOString().slice(11, -1)}`,
                inline: true
            });
        }))
            .setTimestamp();
        return embed;
    }
}
exports.UserActivity = UserActivity;
class ActivityMethods {
    static getAllActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            const guilds = Main_1.main.getClient().guilds.cache.map(guild => guild);
            let members = [];
            for (const guild of guilds) {
                const guildMembers = yield guild.members.fetch();
                for (let member of guildMembers.values()) {
                    if (member instanceof discord_js_1.GuildMember && member.user.bot == false && !members.find(m => m.user.id === member.id)) {
                        members.push(new UserActivity(member));
                    }
                }
            }
            return members;
        });
    }
    static getActivity(user) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const guilds = Main_1.main.getClient().guilds.cache.map(guild => guild);
            for (const guild of guilds) {
                const guildMembers = yield guild.members.fetch();
                for (let member of guildMembers.values()) {
                    if (member instanceof discord_js_1.GuildMember && member.user.id === user) {
                        if ((_a = member.presence) === null || _a === void 0 ? void 0 : _a.activities) {
                            return new UserActivity(member);
                        }
                        else {
                            return null;
                        }
                    }
                }
            }
            return null;
        });
    }
    static logActivity(user) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`User: ${user.user.displayName} is doing: ${user.activities.map(activity => activity.name).join(", ")}`);
            user.activities.forEach(activity => {
                var _a, _b;
                console.log(`${activity.name}`);
                console.log(`${activity.state}`);
                console.log(`${activity.details}`);
                console.log(`${activity.emoji}`);
                console.log(`${activity.flags}`);
                console.log(`${activity.party}`);
                console.log(`${activity.assets}`);
                console.log(`${activity.presence}`);
                console.log(`${activity.state}`);
                console.log(`${activity.url}`);
                let start = (_a = activity.timestamps) === null || _a === void 0 ? void 0 : _a.start;
                let end = (_b = activity.timestamps) === null || _b === void 0 ? void 0 : _b.end;
                console.log(`Start: ${start ? new Date(start).toLocaleString() : "N/A"}`);
            });
        });
    }
}
ActivityMethods.contentTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4"];
exports.default = ActivityMethods;
