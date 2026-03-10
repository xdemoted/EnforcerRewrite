import express from "express";
import { Main } from "../Main";
import { set } from "@dotenvx/dotenvx";
import { Singleton } from "src/container/Singleton";

@Singleton
export default class WebHandler {
    public app = express();

    constructor() {
        this.app.listen(Main.getVariables().APP_PORT || 25551);
        this.app.use((req, res, next) => {
            console.log('IP:', req.ip);
            next();
        });
        
        this.app.use(express.static("src/enforcer/web/assets/"))
        this.loadMainPage();
    }

    private loadMainPage() {
        this.app.get('/', (req, res) => {
            res.sendFile("src/enforcer/web/index.html", { root: '.' });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}