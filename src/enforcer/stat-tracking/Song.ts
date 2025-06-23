import GeneralUtils from "../utils/GeneralUtils";

export default class Song {
    private name: string;
    private artists: string[] = [];

    uniqueListens: number = 0;
    totalListens: number = 0;

    constructor(name: string, artists: string) {
        this.name = name;
        if (artists) {
            this.artists = artists.split("; ");
        }
    }

    public getName(): string {
        return this.name;
    }

    public getArtists(): string[] {
        return this.artists;
    }
}