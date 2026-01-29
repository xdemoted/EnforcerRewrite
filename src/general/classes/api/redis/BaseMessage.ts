export class BaseMessage {
    public serverName: string;
    public data: string;

    constructor(serverName: string, data: string) {
        this.serverName = serverName;
        this.data = data;
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    public static fromJson(jsonstring: string): BaseMessage {
        const obj = JSON.parse(jsonstring as string);
        const message = new BaseMessage(obj.serverName, obj.data);

        return message;
    }
}