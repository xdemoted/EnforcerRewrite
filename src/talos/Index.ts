
import fs from "fs";
import { GenericBot } from "src/general/classes/GenericBot";
import RedisHandler from "./handlers/RedisHandler";
import ProtocolURI from "src/general/classes/ProtocolURI";
import EventHandler from "src/general/handlers/EventHandler";
import { Scope } from "src/container/Scope";
import { Singleton } from "src/container/Singleton";

@Singleton
export class Talos extends GenericBot {
    private protocol = new ProtocolURI(process.env.REDIS_CONN_STRING || "");
    private scope: Scope;

    public constructor(private redisHandler: RedisHandler, eventHandler: EventHandler, scope: Scope) {
        super(Talos.getBotInfo().token, "src/talos/commands", eventHandler, scope);
        this.scope = scope;
    }

    public static getBotInfo(): { token: string, debug: boolean } {
        return require("src/resources/botconfig.json").talos
    }
}