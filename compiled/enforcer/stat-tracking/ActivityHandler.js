"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const MainT_1 = require("../MainT");
const User_1 = __importDefault(require("./User"));
const Song_1 = __importDefault(require("./Song"));
const GeneralUtils_1 = __importStar(require("../utils/GeneralUtils"));
class ActivityHandler {
    constructor() {
        this.lastSave = Date.now();
        this.updateDebounce = new Set();
        this.users = new GeneralUtils_1.SearchMap();
        this.songs = new GeneralUtils_1.SearchMap();
        this.artists = new GeneralUtils_1.SearchMap();
        this.shows = [];
        this.games = [];
        setInterval(() => {
            this.runDataSave();
        }, 1000 * 60 * 60);
    }
    processMember(member) {
        var _a;
        if (this.updateDebounce.has(member.id))
            return;
        this.updateDebounce.add(member.id);
        setTimeout(() => {
            this.updateDebounce.delete(member.id);
        }, 250);
        if (!member || member.user.bot)
            return;
        let user = this.users.get(member.id);
        if (!user) {
            user = User_1.default.fromGuildMember(member);
            this.users.set(member.id, user);
        }
        (_a = member === null || member === void 0 ? void 0 : member.presence) === null || _a === void 0 ? void 0 : _a.activities.forEach((activity) => {
            switch (activity.type) {
                case discord_js_1.ActivityType.Listening:
                    {
                        if (activity.name == "Spotify") {
                            let result = this.songs.find((song) => song.getName() === activity.details && song.getArtists().join("; ") === activity.state);
                            if (!result) {
                                let song = new Song_1.default(activity.details, activity.state);
                                const id = GeneralUtils_1.default.generateUniqueID(this.songs.getKeys());
                                this.songs.set(id, song);
                                user.addSong(id);
                                song.uniqueListens++;
                                song.totalListens++;
                            }
                            else if (!user.wasLastSong(result.key)) {
                                const song = result.value;
                                song.totalListens++;
                                if (!user.findSong(result.key)) {
                                    song.uniqueListens++;
                                }
                                user.addSong(result.key);
                            }
                        }
                    }
                    break;
                default:
                    {
                    }
                    break;
            }
        });
        this.runDataSave();
    }
    runDataSave() {
        if (Date.now() - this.lastSave > 1000 * 60) {
            console.log("Saving data at " + new Date().toLocaleString());
            this.lastSave = Date.now();
            MainT_1.main.getFileHandler().performDataSave(this);
        }
    }
}
exports.default = ActivityHandler;
