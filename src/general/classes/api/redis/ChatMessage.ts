import { BaseMessage } from "./BaseMessage";

export default class ChatMessage extends BaseMessage {
    name: string;
    uuid: string;

    constructor(serverName: string, uuid: string, name: string, message: string) {
        super(serverName, message);
        this.uuid = uuid;
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getUUID(): string {
        return this.uuid;
    }

    public getMessage(): string {
        return this.data;
    }

    public static override fromJson(jsonstring: string): ChatMessage {
        const obj = JSON.parse(jsonstring as string);
        return new ChatMessage(obj.serverName, obj.uuid, obj.name, obj.data);
    }
}