import { Operator } from "../classes/Operator";

export default class GeneralUtils {
    static modifyNumber(number: number, amount: number, operator: Operator = Operator.ADD) {
        switch (operator) {
            case Operator.ADD:
                number += amount;
            case Operator.SUBTRACT:
                number -= amount;
            case Operator.MULTIPLY:
                number *= amount;
            case Operator.DIVIDE:
                number /= amount;
        }
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

    public static getXPForLevel(level: number): number {
        if (level < 0) {
            throw new Error("Level must be a non-negative integer.");
        }
        return Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
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