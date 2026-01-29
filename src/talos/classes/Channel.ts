import { TextChannel } from "discord.js";

class Channel {
    public id: string;
    public name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static fromDiscordChannel(channel: TextChannel): Channel {
        return new Channel(channel.id, channel.name);
    }
}

export { Channel }