export default class ProtocolURI {
    public protocol: string;
    public address: string;
    public port?: number;
    public username?: string;
    public password?: string;

    constructor(uri: string) {
        const parts = uri.split(/:\/\/|@/g);

        if (parts.length != 3) {
            throw new Error("Invalid URI format");
        }

        this.protocol = parts[0];
        const authParts = parts[1].split(":");

        if (authParts.length === 2) {
            this.username = authParts[0];
        }

        this.password = authParts[authParts.length - 1];

        const addressParts = parts[2].split(":");
        this.address = addressParts[0];
        if (addressParts.length === 2) {
            this.port = parseInt(addressParts[1]);
        }
    }
}