"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Song {
    constructor(name, artists) {
        this.artists = [];
        this.uniqueListens = 0;
        this.totalListens = 0;
        this.name = name;
        this.artists = artists.split("; ");
    }
    getName() {
        return this.name;
    }
    getArtists() {
        return this.artists;
    }
}
exports.default = Song;
