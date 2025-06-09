import { CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

export default abstract class BaseCommand {
  public abstract getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  public abstract execute(interaction:CommandInteraction): Promise<void>;
}