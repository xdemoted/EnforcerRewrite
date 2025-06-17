import { Activity, EmbedBuilder, GuildMember, User } from 'discord.js';
import fetch from 'node-fetch';
import { Main } from '../temp';

export class UserActivity {
    public user: GuildMember;
    public activities: Activity[];

    constructor(user: GuildMember) {
        this.user = user;
        this.activities = user.presence?.activities || [];
    }

    public toEmbed(): EmbedBuilder {
        let status: string | null = null;

        for (const activity of this.activities) {
            if (activity.name === 'Custom Status') {
                status = activity.state;
                this.activities.splice(this.activities.indexOf(activity), 1);
                break;
            }
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: this.user.displayName
            })
            .setColor(0x00AE86)
            .setTitle(status || "No Custom Status")
            .setFields(
                this.activities.map(activity => ({
                    name: (activity.name == "Spotify" ? (activity.details || "unknown song") : activity.name),
                    value: activity.name == "Spotify" ? (activity.state || "unknown song") : `${new Date(Date.now() - (activity.timestamps?.start ? activity.timestamps.start.getTime() : 0)).toISOString().slice(11, -1)}`,
                    inline: true
                }))
            )
            .setTimestamp();

        return embed;
    }
}

export default class ActivityMethods {
    private static contentTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4"];

    static async getAllActivity(): Promise<UserActivity[]> {
        const guilds = Main.getClient().guilds.cache.map(guild => guild);
        let members: UserActivity[] = [];

        for (const guild of guilds) {
            const guildMembers = await guild.members.fetch();
            for (let member of guildMembers.values()) {
                if (member instanceof GuildMember && member.user.bot == false && !members.find(m => m.user.id === member.id)) {
                    members.push(new UserActivity(member));
                }
            }
        }

        return members;
    }

    static async getActivity(user: string): Promise<UserActivity | null> {
        const guilds = Main.getClient().guilds.cache.map(guild => guild);

        for (const guild of guilds) {
            const guildMembers = await guild.members.fetch();
            for (let member of guildMembers.values()) {
                if (member instanceof GuildMember && member.user.id === user) {
                    if (member.presence?.activities) {
                        return new UserActivity(member);
                    } else {
                        return null;
                    }
                }
            }
        }

        return null;
    }

    static async logActivity(user: UserActivity): Promise<void> {
        console.log(`User: ${user.user.displayName} is doing: ${user.activities.map(activity => activity.name).join(", ")}`);
        user.activities.forEach(activity => {
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
            let start = activity.timestamps?.start;
            let end = activity.timestamps?.end;
            console.log(`Start: ${start ? new Date(start).toLocaleString() : "N/A"}`);
        });
    }
}