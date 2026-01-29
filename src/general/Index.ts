import { Main } from "src/enforcer/Main";
import { Talos } from "src/talos/Index";
import MongoConnector from "./handlers/MongoConnector";
import RedisConnector from "./handlers/RedisConnector";

class Index {
    static instance: Index;

    private constructor() {
        this.startBots();
    }

    public async startBots(): Promise<void> {
        MongoConnector.getInstance();
        RedisConnector.getInstance();
        Main.getInstance();
        Talos.getInstance();
    }

    static getInstance(): Index {
        if (!Index.instance) this.instance = new Index();
        return Index.instance;
    }
}

Index.getInstance();