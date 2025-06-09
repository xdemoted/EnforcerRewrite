"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Artist {
    constructor(name) {
        this.songs = [];
        this.name = name;
    }
    getName() {
        return this.name;
    }
    getTotalListens(activity) {
        let totalListens = 0;
        for (const songID of this.songs) {
            const song = activity.songs.get(songID);
            if (!song)
                continue;
            totalListens += song.totalListens;
        }
        return totalListens;
    }
    getUniqueListens(activity) {
        let uniqueListens = 0;
        for (const songID of this.songs) {
            const song = activity.songs.get(songID);
            if (!song)
                continue;
            uniqueListens += song.uniqueListens;
        }
        return uniqueListens;
    }
}
exports.default = Artist;
