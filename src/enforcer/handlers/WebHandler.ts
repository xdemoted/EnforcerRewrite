import express from "express";
import { Main } from "../Main";
import { set } from "@dotenvx/dotenvx";

class WebHandler {
    private static instance: WebHandler;
    public app = express();

    constructor() {
        this.app.listen(Main.getVariables().APP_PORT || 25551);
        this.app.use(express.static("src/enforcer/web/assets/"));
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

    static getInstance(): WebHandler {
        if (!WebHandler.instance) {
            WebHandler.instance = new WebHandler();
        }
        return WebHandler.instance;
    }
}

export default WebHandler;