import { ActivityType, GuildMember } from "discord.js";
import { Main } from "../main";
import User from "./User";
import Song from "./Song";
import Artist from "./Artist";
import GeneralUtils, { SearchMap, SearchResult } from "../utils/GeneralUtils";

export default class ActivityHandler {
    lastSave: number = Date.now();
    updateDebounce: Set<string> = new Set();

    users: SearchMap<string, User> = new SearchMap();
    songs: SearchMap<string, Song> = new SearchMap();
    artists: SearchMap<string, Artist> = new SearchMap();
    shows: string[] = [];
    games: string[] = [];

    constructor() {
        setInterval(() => {
            this.runDataSave();
        }, 1000 * 60 * 60);
    }

    public processMember(member: GuildMember): void {
        if (this.updateDebounce.has(member.id)) return;
        this.updateDebounce.add(member.id);

        setTimeout(() => {
            this.updateDebounce.delete(member.id);
        }, 250);

        if (!member || member.user.bot) return;

        let user:User = this.users.get(member.id);

        if (!user) {
            user = User.fromGuildMember(member);
            this.users.set(member.id, user);
        }

        member?.presence?.activities.forEach((activity) => {
            switch (activity.type) {
                case ActivityType.Listening: {
                    if (activity.name == "Spotify") {
                        let result: SearchResult<string, Song> | undefined = this.songs.find((song) => song.getName() === activity.details && song.getArtists().join("; ") === activity.state);
                        
                        if (!result) {
                            let song = new Song(activity.details as string, activity.state as string);
                            const id = GeneralUtils.generateUniqueID(this.songs.getKeys());

                            this.songs.set(id, song);
                            user.addSong(id);
                            song.uniqueListens++;
                            song.totalListens++;
                        } else if (!user.wasLastSong(result.key)) {
                            const song = result.value;
                            song.totalListens++;

                            if (!user.findSong(result.key)) {
                                song.uniqueListens++;
                            }

                            user.addSong(result.key);
                        }
                    }
                } break;
                default: {

                } break;
            }
        });

        this.runDataSave();
    }

    private runDataSave(): void {
        if (Date.now() - this.lastSave > 1000 * 60) {
            console.log("Saving data at " + new Date().toLocaleString());
            this.lastSave = Date.now();
            Main.getInstance().getFileHandler().performDataSave(this);
        }
    }
}