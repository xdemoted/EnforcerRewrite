"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const BaseCommand_1 = __importDefault(require("../classes/BaseCommand"));
const Main_1 = require("../Main");
const ActivityMethods_1 = __importDefault(require("../utils/ActivityMethods"));
class Activity extends BaseCommand_1.default {
    Activity() {
    }
    getCommand() {
        return new discord_js_1.SlashCommandBuilder()
            .setName("activity")
            .setDescription("Tag Manager")
            .addStringOption(option => option.setName("user")
            .setDescription("User to get activity from")
            .setRequired(false))
            .setIntegrationTypes([discord_js_1.ApplicationIntegrationType.UserInstall])
            .setContexts([discord_js_1.InteractionContextType.PrivateChannel, discord_js_1.InteractionContextType.Guild])
            .toJSON();
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield interaction.deferReply();
            let activities = Main_1.main.getActivityHandler();
            console.log(activities.songs);
            //console.log(activities.users);
            activities.users.forEach(user => {
                console.log(user);
            });
            let id = (_a = interaction.options.get("user")) === null || _a === void 0 ? void 0 : _a.value;
            let message = "";
            if (!id) {
                console.log("No user specified, getting all activities.");
                ActivityMethods_1.default.getAllActivity().then((userActivities) => __awaiter(this, void 0, void 0, function* () {
                    for (const userActivity of userActivities) {
                        const activities = userActivity.activities.map(activity => activity.name).join(", ");
                        const activityMessage = `${userActivity.user.displayName} is doing: ${activities || "nothing"}\n`;
                        if (message.length + activityMessage.length < 2000) {
                            message += activityMessage;
                        }
                        else {
                            yield interaction.followUp({ content: message });
                            message = activityMessage;
                        }
                    }
                    if (message.length > 0) {
                        yield interaction.followUp({ content: message });
                    }
                    else {
                        yield interaction.followUp({ content: "No activities found." });
                    }
                    interaction.editReply({ content: "Logged to console." });
                }));
            }
            else {
                console.log("User specified, getting activity for user: " + id);
                let userActivity = yield ActivityMethods_1.default.getActivity(id);
                if (userActivity) {
                    const activities = userActivity.activities.map(activity => activity.name).join(", ");
                    message += `${userActivity.user.displayName} is doing: ${activities || "nothing"}`;
                    interaction.editReply({ embeds: [userActivity.toEmbed()] });
                    ActivityMethods_1.default.logActivity(userActivity);
                    return;
                }
                else {
                    message += "No activities found.";
                }
                if (message.length > 0) {
                    yield interaction.followUp({ content: message });
                }
                else {
                    yield interaction.followUp({ content: "No activities found." });
                }
            }
        });
    }
}
module.exports = new Activity();
