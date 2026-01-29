import redis, { createClient } from 'redis';
import ProtocolURI from '../classes/ProtocolURI';

export default class RedisConnector {
    private static instance: RedisConnector;
    private client?: redis.RedisClientType;

    private constructor() {
        this.connect()
    }

    public async connect(): Promise<void> {
        let uri;
        try {
            uri = new ProtocolURI(process.env.REDIS_CONN_STRING || "");
        } catch (error) {
            console.error("URI Parse Failed:", error);
        }

        this.client = createClient({
            socket: { host: uri?.address, port: uri?.port },
            password: uri?.password
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis successfully.');

            process.on('SIGINT', () => {
                if (!this.client) return;

                this.client.quit().then(() => {
                    process.exit(0);
                });
            });
        });

        this.client.on('error', (error) => {
            console.error('Failed to connect to Redis:', error);
            throw error;
        });

        await this.client.connect();
    }

    public getClient() {
        return this.client;
    }

    public refreshClient(): void {
        this.client = undefined;
        this.connect();
    }

    public static getInstance(): RedisConnector {
        if (!RedisConnector.instance) {
            RedisConnector.instance = new RedisConnector();
        }
        return RedisConnector.instance;
    }
}