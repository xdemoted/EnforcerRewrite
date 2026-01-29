
import fs from "fs";
import {GenericBot} from "src/general/classes/GenericBot";
import RedisHandler from "./handlers/RedisHandler";

export class Talos extends GenericBot {
    static instance: Talos;

    public constructor() {
        super(Talos.getBotInfo().token, "src/talos/commands");

        this.client.on('ready', () => {
            RedisHandler.getInstance();
        });
    }

    public static getBotInfo(): { token: string, debug: boolean } {
        return require("src/resources/botconfig.json").talos
    }

    public static override getInstance(): Talos {
        if (!Talos.instance) return new Talos();
        console.log("Talos instance already exists, returning existing instance.");
        return Talos.instance;
    }
}