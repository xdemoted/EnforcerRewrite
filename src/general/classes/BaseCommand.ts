import { CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";

export default abstract class BaseCommand {
  public abstract getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody;
  public abstract execute(interaction:CommandInteraction): Promise<void>;
  public deferReply: boolean = true;
  public restricted: boolean = false;
}