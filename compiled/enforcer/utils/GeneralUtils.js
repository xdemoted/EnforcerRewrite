"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMap = exports.SearchResult = void 0;
class GeneralUtils {
    static getRandomID() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
    static generateUniqueID(existingIDs) {
        let newID;
        do {
            newID = this.getRandomID();
        } while (existingIDs.includes(newID));
        return newID;
    }
    static getXPForLevel(level) {
        if (level < 0) {
            throw new Error("Level must be a non-negative integer.");
        }
        return Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
    }
}
exports.default = GeneralUtils;
class SearchResult {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
exports.SearchResult = SearchResult;
class SearchMap extends Map {
    constructor() {
        super();
    }
    find(predicate) {
        for (const [key, value] of this) {
            if (predicate(value, key, this)) {
                return new SearchResult(key, value);
            }
        }
        return undefined;
    }
    forEach(callbackfn, thisArg) {
        for (const [key, value] of this) {
            callbackfn.call(thisArg, value, key, this);
        }
    }
    getValues() {
        const values = [];
        for (const value of this.values()) {
            values.push(value);
        }
        return values;
    }
    getKeys() {
        const keys = [];
        for (const key of this.keys()) {
            keys.push(key);
        }
        return keys;
    }
}
exports.SearchMap = SearchMap;
