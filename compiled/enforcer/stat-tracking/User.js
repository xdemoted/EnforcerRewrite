"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GeneralUtils_1 = require("../utils/GeneralUtils");
class UserSong {
    constructor() {
        this.listens = 1;
    }
}
class User {
    constructor(name) {
        this.songs = new GeneralUtils_1.SearchMap();
        this.Games = [];
        this.shows = [];
        this.name = name;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    findSong(id) {
        return this.songs.find((song, songID) => songID === id);
    }
    addSong(id) {
        if (this.lastSongID && this.lastSongID === id)
            return;
        const song = this.findSong(id);
        if (song) {
            song.value.listens++;
            this.setLastSong(id);
            return;
        }
        else {
            const newSong = new UserSong();
            this.songs.set(id, newSong);
            return;
        }
    }
    wasLastSong(id) {
        if (this.lastSongID) {
            return this.lastSongID === id;
        }
        return false;
    }
    setLastSong(id) {
        this.lastSongID = id;
    }
    static fromGuildMember(member) {
        return new User(member.user.displayName);
    }
}
exports.default = User;
