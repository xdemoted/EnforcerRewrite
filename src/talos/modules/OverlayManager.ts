import { Singleton } from "src/container/Singleton";
import WebHandler from "src/general/handlers/WebHandler";
import fs from "fs";
import HTMLUtils from "src/general/utils/HTMLUtils";
import { CommandInteraction, ButtonInteraction, Interaction } from "discord.js";
import { JsxEmit } from "typescript";
import { OverlayUpdate } from "../classes/overlays/OverlayUpdate";

@Singleton
export class OverlayManager {
    private webHandler: WebHandler;
    private overlays: Map<string, Overlay> = new Map();

    constructor(webHandler: WebHandler) {
        this.webHandler = webHandler;
        this.startListener();
    }

    public createOverlay(id: string, teams: Team[]): Overlay {
        const overlay = new Overlay(id, teams);
        this.overlays.set(id, overlay);
        return overlay;
    }

    public startListener() {
        this.webHandler.getApp().get('/overlay', (req, res) => {
            const userId = req.query.userId;

            if (typeof userId !== "string") {
                return res.status(400).send("Missing userId query parameter");
            } else if (!this.overlays.has(userId)) {
                return res.status(404).send("Overlay not found");
            }

            fs.readFile("src/enforcer/web/overlaystyles/mkworld.html", 'utf8', (err: any, data: string) => {
                if (err) return res.status(500).send(err);

                data = data.replaceAll(/\.\/assets\//g, "/");

                const overlay = this.overlays.get(userId);

                if (!overlay) return res.status(404).send("Overlay not found");

                data = HTMLUtils.fillTemplate(data, {
                    team1: overlay.teams[0].name,
                    team1logo: overlay.teams[0].logoURL,
                    team2: overlay.teams[1].name,
                    team2logo: overlay.teams[1].logoURL
                });

                res.send(data);
            });
        })
    }

    public updateOverlay(id: string, team1Score: number, team2Score: number, round?: number): boolean {
        const overlay = this.overlays.get(id);
        if (!overlay) return false;

        overlay.teams[0].score = team1Score;
        overlay.teams[1].score = team2Score;

        this.webHandler.sendOverlayUpdate(id, team1Score, team2Score, round ?? overlay.round);

        return true;
    }

    public getOverlay(id: string): Overlay | undefined {
        return this.overlays.get(id);
    }
}

export class Overlay {
    createdAt: number;
    createdBy: string;
    teams: Team[];
    round: number = 1;

    public constructor(createdBy: string, teams: Team[]) {
        this.createdAt = Date.now();
        this.createdBy = createdBy;
        this.teams = teams;
    }

    public static standardOverlay(createdBy: string, team1: Team, team2: Team) {
        return new Overlay(createdBy, [team1, team2]);
    }
}

export interface Team {
    logoURL: string;
    name: string;
    score: number;
}