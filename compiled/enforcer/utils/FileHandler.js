"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class FileHandler {
    constructor() {
        this.usersPath = '../resources/users';
        this.songsPath = '../resources/songs';
        this.showsPath = '../resources/shows';
        this.gamesPath = '../resources/games';
        this.makeDir();
        this.performDataLoad();
    }
    makeDir() {
        if (!fs_1.default.existsSync('../resources')) {
            fs_1.default.mkdirSync('../resources');
        }
        if (!fs_1.default.existsSync(this.usersPath)) {
            fs_1.default.mkdirSync(this.usersPath);
        }
        if (!fs_1.default.existsSync(this.songsPath)) {
            fs_1.default.mkdirSync(this.songsPath);
        }
        if (!fs_1.default.existsSync(this.showsPath)) {
            fs_1.default.mkdirSync(this.showsPath);
        }
        if (!fs_1.default.existsSync(this.gamesPath)) {
            fs_1.default.mkdirSync(this.gamesPath);
        }
    }
    performDataLoad() {
        const users = this.getDataArray(this.usersPath);
        const songs = this.getDataArray(this.songsPath);
        const shows = this.getDataArray(this.showsPath);
        const games = this.getDataArray(this.gamesPath);
        console.log('Users:', users);
        console.log('Songs:', songs);
        console.log('Shows:', shows);
        console.log('Games:', games);
    }
    performDataSave(activity) {
        const users = activity.users;
        const songs = activity.songs;
        const shows = activity.shows;
        const games = activity.games;
        users.forEach((user, id) => {
            const userPath = `${this.usersPath}/${id}.json`;
            fs_1.default.writeFileSync(userPath, JSON.stringify(user));
        });
        songs.forEach((song, id) => {
            const songPath = `${this.songsPath}/${id}.json`;
            fs_1.default.writeFileSync(songPath, JSON.stringify(song));
        });
        console.log('Data saved successfully.');
    }
    getDataArray(path) {
        const files = fs_1.default.readdirSync(path);
        const data = [];
        for (const file of files) {
            const filePath = `${path}/${file}`;
            const fileData = fs_1.default.readFileSync(filePath, 'utf-8');
            try {
                JSON.parse(fileData);
            }
            catch (error) {
                console.error(`Error parsing JSON from file ${file}:`, error);
                continue;
            }
            data.push(fileData);
        }
        return data;
    }
}
exports.default = FileHandler;
