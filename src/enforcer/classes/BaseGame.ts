import { TextChannel } from "discord.js";

export default abstract class BaseGame {
    constructor(
        public channel: TextChannel
    ) {}
}