import { GuildMember } from "discord.js";
import { SearchMap, SearchResult } from "../utils/GeneralUtils";

class UserSong {
    listens: number = 1;
}

export default class User {
    private name: string;

    lastSongID: string | undefined;
    songs: SearchMap<string, UserSong> = new SearchMap();

    lastGame: string | undefined;
    Games: string[] = [];

    lastShow: string | undefined;
    shows: string[] = [];

    public constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public findSong(id:string): SearchResult<string, UserSong> | undefined {
        return this.songs.find((song, songID) => songID === id);
    }

    public addSong(id: string): void {
        if (this.lastSongID && this.lastSongID === id)
            return;

        const song = this.findSong(id);
        if (song) {
            song.value.listens++;
            this.setLastSong(id);
            return;
        } else {
            const newSong = new UserSong();
            this.songs.set(id, newSong);
            return;
        }
    }

    public wasLastSong(id: string): boolean {
        if (this.lastSongID) {
            return this.lastSongID === id;
        }

        return false;
    }

    public setLastSong(id: string): void {
        this.lastSongID = id;
    }

    public static fromGuildMember(member: GuildMember): User {
        return new User(member.user.displayName);
    }
}