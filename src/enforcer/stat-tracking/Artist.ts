import GeneralUtils from "../utils/GeneralUtils";
import ActivityHandler from "./ActivityHandler";

export default class Artist {
    private name: string;

    songs: string[] = [];

    constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getTotalListens(activity:ActivityHandler): number {
        let totalListens = 0;

        for (const songID of this.songs) {
            const song = activity.songs.get(songID);

            if (!song) continue;

            totalListens += song.totalListens;
        }

        return totalListens;
    }

    public getUniqueListens(activity:ActivityHandler): number {
        let uniqueListens = 0;

        for (const songID of this.songs) {
            const song = activity.songs.get(songID);

            if (!song) continue;

            uniqueListens += song.uniqueListens;
        }

        return uniqueListens;
    }
}