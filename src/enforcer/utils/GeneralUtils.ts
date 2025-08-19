import { CommandInteraction, GuildMember, Interaction, Message } from "discord.js";
import { Operator } from "../classes/Operator";

export default class GeneralUtils {
    static modifyNumber(number: number, amount: number, operator: Operator = Operator.ADD) {
        console.log(`Modifying number: ${number} by ${amount} with operator:`);
        switch (operator) {
            case Operator.ADD:
                number += amount;
                break;
            case Operator.SUBTRACT:
                number -= amount;
                break;
            case Operator.MULTIPLY:
                number *= amount;
                break;
            case Operator.DIVIDE:
                number /= amount;
                break;
            case Operator.POWER:
                number = Math.pow(number, amount);
                break;
            case Operator.MODULO:
                number %= amount;
                break;
            case Operator.SET:
                number = amount;
                break;
        }
        console.log(`Result after modification: ${number}`);
        return number;
    }

    static async scheduleDeletion(originalContent: Message | Interaction, time: number) {
        let message;
        if (originalContent instanceof Message) {
            message = originalContent;
        } else if ((!originalContent.isAutocomplete()) && originalContent.replied) {
            message = await originalContent.fetchReply();
        }

        if (message) {
            setTimeout(() => {
                message.delete().catch(console.error);
            }, time);
        } else {
            console.warn("No message to delete after scheduling.");
        }
    } 

    static getInteractDisplayName(interaction:Interaction) {
        if (interaction.member && interaction.member instanceof GuildMember) {
            return interaction.member.displayName;
        } else if (interaction.user) {
            return interaction.user.username;
        } else {
            return "Unknown"
        }
    }

    static timeSince(epoch: number): number {
        return Date.now() - epoch;
    }

    static randomNumber(min: number, max: number): number {
        if (min > max) return max;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomID(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }

    static generateUniqueID(existingIDs: string[]): string {
        let newID: string;
        do {
            newID = this.getRandomID();
        } while (existingIDs.includes(newID));
        return newID;
    }

    static getLevelForXP(xp: number): number {
        if (xp < 0) {
            throw new Error("XP must be a non-negative integer.");
        }
        let level = 0;
        while (xp >= this.getXPForLevel(level)) {
            xp -= this.getXPForLevel(level);
            level++;
        }
        return level;
    }

    public static getXPForLevel(level: number): number {
        if (level < 0) {
            throw new Error("Level must be a non-negative integer.");
        }
        return Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
    }

    public static convertToMap<K>(keyObject: {[key: string]: K}): Map<string, K> {
        const map = new Map<string, K>();
        for (const key in keyObject) {
            if (keyObject.hasOwnProperty(key)) {
                map.set(key, keyObject[key]);
            }
        }
        return map;
    }

    public static shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

export class SearchResult<K, V> {
    public key: K;
    public value: V;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }
}

export class SearchMap<K, V> extends Map {
    constructor() {
        super();
    }

    public find(predicate: (value: V, key: K, map: Map<K, V>) => boolean): SearchResult<K, V> | undefined {
        for (const [key, value] of this) {
            if (predicate(value, key, this)) {
                return new SearchResult<K, V>(key, value);
            }
        }
        return undefined;
    }

    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        for (const [key, value] of this) {
            callbackfn.call(thisArg, value, key, this);
        }
    }

    public getValues(): V[] {
        const values: V[] = [];
        for (const value of this.values()) {
            values.push(value);
        }
        return values;
    }

    public getKeys(): K[] {
        const keys: K[] = [];
        for (const key of this.keys()) {
            keys.push(key);
        }
        return keys;
    }
}

export class Time {
    static HOUR = 60 * 60 * 1000;
    static MINUTE = 60 * 1000;
    static SECOND = 1000;

    public milliseconds: number;

    public days: number;
    public hours: number;
    public minutes: number;
    public seconds: number;

    constructor(milliseconds: number) {
        this.milliseconds = milliseconds;

        this.days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        this.hours = Math.floor(milliseconds / (1000 * 60 * 60) % 24);
        this.minutes = Math.floor((milliseconds / (1000 * 60) % 60));
        this.seconds = Math.floor((milliseconds / 1000) % 60);
    }

    public value(): number {
        return this.milliseconds;
    }

    public static timeLeft(end: number, currentTime?: number): Time {
        let timeLeft = end - (currentTime || Date.now());

        if (timeLeft < 0) {
            timeLeft = 0;
        }

        return new Time(timeLeft);
    }

    public formatDuration(): string {
        const parts = [];
        if (this.days > 0) parts.push(`${this.days}d`);
        if (this.hours > 0) parts.push(`${this.hours}h`);
        if (this.minutes > 0) parts.push(`${this.minutes}m`);
        if (this.seconds > 0) parts.push(`${this.seconds}s`);
        return parts.join(' ') || '0s';
    }
}

/*
 const timeLeft = 18 * 60 * 60 * 1000 - (Date.now() - user.stats.lastDaily);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            await interaction.editReply({content:`You can claim your daily reward in ${hours}h ${minutes}m ${seconds}s.`});
            deleteAfter = 10 * 1000;
*/