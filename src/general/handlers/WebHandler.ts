import express from "express";
import { Main } from "../../enforcer/Main";
import { set } from "@dotenvx/dotenvx";
import { Singleton } from "src/container/Singleton";
import { WebSocket, WebSocketServer } from "ws";
import { OverlayUpdate } from "src/talos/classes/overlays/OverlayUpdate";

@Singleton
export default class WebHandler {
    private app = express();
    private wssManager: WSSManager;

    constructor() {
        let port = Main.getVariables().APP_PORT ? Number(Main.getVariables().APP_PORT) + 1 : 25552;

        this.app.listen(port);
        this.app.use((req, res, next) => {
            console.log('IP:', req.ip);
            next();
        });

        this.app.use(express.static("src/enforcer/web/assets/"))
        this.loadMainPage();

        this.wssManager = new WSSManager();
    }

    private loadMainPage() {
        this.app.get('/', (req, res) => {
            res.sendFile("src/enforcer/web/index.html", { root: '.' });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    public getWSSManager(): WSSManager {
        return this.wssManager;
    }

    public sendOverlayUpdate(overlayId: string, team1Score: number, team2Score: number, round?: number) {
        this.wssManager.sendMessageToClient(overlayId, new OverlayUpdate(overlayId,team1Score,team2Score, round), "overlay");
    }
}

export class WSSManager {
    private wss: WebSocketServer;
    private clients: { id: string, purpose: string, ws: WebSocket }[] = [];

    constructor() {
        this.wss = new WebSocketServer({ port: Main.getVariables().APP_PORT ? Number(Main.getVariables().APP_PORT) + 2 : 25553 });
        this.startClientListener();
    }

    public getWSS(): WebSocketServer {
        return this.wss;
    }

    public startClientListener() {
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            let isIdentified = false;

            ws.on('message', (message) => {
                console.log('Received message:', message);
                if (message.toString().startsWith("id:") && !isIdentified) {
                    const parts = message.toString().split(":");
                    // Validate format: id:someId:purpose:somePurpose (at least 4 parts)
                    if (parts.length < 4) {
                        console.error('Invalid identification format:', message.toString());
                        return;
                    }

                    const id = parts[1];
                    const purpose = parts[3];

                    if (!id || !purpose) {
                        console.error('Empty id or purpose in identification');
                        return;
                    }

                    this.clients.push({ id, purpose, ws });
                    isIdentified = true;
                    console.log(`Registered client with ID: ${id} and purpose: ${purpose}`);
                }
            });

            ws.on('close', () => {
                this.clients = this.clients.filter(client => client.ws !== ws);
                console.log('Client disconnected');
            });
        })
    }

    public sendMessageToClient(id: string, data: any, purpose?: string) {
        const matchingClients = this.clients.filter(client =>
            client.id === id && (!purpose || client.purpose === purpose)
        );

        for (const client of matchingClients) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(data));
            }
        }

        if (matchingClients.length === 0) {
            console.warn(`No matching clients found for ID: ${id}, purpose: ${purpose}`);
        }
    }
}