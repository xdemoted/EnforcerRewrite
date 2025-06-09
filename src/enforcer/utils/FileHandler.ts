import fs from 'fs';
import ActivityHandler from '../stat-tracking/ActivityHandler';
import { SearchMap } from './GeneralUtils';
import User from '../stat-tracking/User';

export default class FileHandler {
    private usersPath: string = '../resources/users';
    private songsPath: string = '../resources/songs';
    private showsPath: string = '../resources/shows';
    private gamesPath: string = '../resources/games';

    constructor() {
        this.makeDir();
        this.performDataLoad();
    }

    private makeDir(): void {
        if (!fs.existsSync('../resources')) {
            fs.mkdirSync('../resources');
        }

        if (!fs.existsSync(this.usersPath)) {
            fs.mkdirSync(this.usersPath);
        }

        if (!fs.existsSync(this.songsPath)) {
            fs.mkdirSync(this.songsPath);
        }

        if (!fs.existsSync(this.showsPath)) {
            fs.mkdirSync(this.showsPath);
        }

        if (!fs.existsSync(this.gamesPath)) {
            fs.mkdirSync(this.gamesPath);
        }
    }

    private performDataLoad(): void {
        const users = this.getDataArray(this.usersPath);
        const songs = this.getDataArray(this.songsPath);
        const shows = this.getDataArray(this.showsPath);
        const games = this.getDataArray(this.gamesPath);

        console.log('Users:', users);
        console.log('Songs:', songs);
        console.log('Shows:', shows);
        console.log('Games:', games);
    }

    public performDataSave(activity:ActivityHandler): void {
        const users = activity.users
        const songs = activity.songs
        const shows = activity.shows
        const games = activity.games

        users.forEach((user, id) => {
            const userPath = `${this.usersPath}/${id}.json`;
            fs.writeFileSync(userPath, JSON.stringify(user));
        });

        songs.forEach((song, id) => {
            const songPath = `${this.songsPath}/${id}.json`;
            fs.writeFileSync(songPath, JSON.stringify(song));
        });

        console.log('Data saved successfully.');
    }

    private getDataArray(path: string): string[] {
        const files = fs.readdirSync(path);
        const data: string[] = [];

        for (const file of files) {
            const filePath = `${path}/${file}`;
            const fileData = fs.readFileSync(filePath, 'utf-8');

            try {
            JSON.parse(fileData); 
            } catch (error) {
                console.error(`Error parsing JSON from file ${file}:`, error);
                continue;
            }
            data.push(fileData);
        }

        return data;
    }
}