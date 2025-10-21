import GenericBot from "src/general/classes/GenericBot";
import fs from "fs";

class Talos extends GenericBot {

    public constructor() {
        super(Talos.getBotInfo().token, "src/talos/commands");
    }

    public static getBotInfo(): { token: string, debug: boolean } {
        return require("src/resources/botconfig.json").talos
    }

    public static override getInstance(): Talos {
        if (!Talos.instance) return new Talos();
        return Talos.instance;
    }
}

export default Talos;