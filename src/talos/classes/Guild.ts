import { Channel } from "./Channel";

class Guild {
    public id: string;
    public channels: Map<string, Channel>;

    constructor(id: string) {
        this.id = id;
        this.channels = new Map<string, Channel>();
    }


}

export { Guild }