import { ApplicationIntegrationType, InteractionContextType, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User, Guild, GuildMember } from "discord.js";
import BaseCommand from "../classes/BaseCommand";
import { Main } from "../Main";
import express from "express";
import UserHandler from "../handlers/UserHandler";
import fs, { appendFile } from "fs";
import MongoHandler from "../handlers/MongoHandler";
import { UserRating } from "../classes/api/mongodb/User";
import Waifu from "../classes/api/Waifu";
import { Rating } from "../classes/Rating";
import { json } from "stream/consumers";

class Gallery extends BaseCommand {
    static app = express();

    constructor() {
        super();
        Gallery.app.listen(25551);
        Gallery.app.use(express.static("./web/assets/"));
    }

    private card = `<div class="waifucard" style="background-image: url(imageURL); background-size: 100% 100%;"><div class="waifuDetails"><h2>rating</h2></div></div>`

    public getCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName("gallery")
            .setDescription("List all your waifus.")
            .addUserOption(option => option.setName("user").setDescription("The user gallery to display.").setRequired(false))
            .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
            .setContexts([InteractionContextType.PrivateChannel, InteractionContextType.Guild])
            .toJSON();
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const discordUser = interaction.options.get("user")?.user || interaction.user;
        const user = await UserHandler.getInstance().getUser(discordUser.id);

        const waifus = user.stats.waifus

        if (waifus.length === 0) {
            await interaction.editReply({ content: "You have no waifus in your gallery." });
            return;
        }

        const mongoWaifus: UserWaifu[] = (await Promise.all(waifus.map(async waifu => new UserWaifu(await MongoHandler.getInstance().getWaifu(waifu.id) as Waifu, waifu.rating))))
        .filter(waifu => waifu.waifu != null)
        .sort((a, b) => {
            return a.rating - b.rating
        });

        const htmlWaifus: HTMLWaifu[] = mongoWaifus.map(waifu => new HTMLWaifu(waifu.waifu.url, waifu.waifu.rating == Rating.SAFE ? "waifucard" : "waifucard explicit", waifu.rating == UserRating.MOMMY ? "Mommy" : waifu.rating == UserRating.SMASH ? "Smash" : waifu.rating == UserRating.PASS ? "Pass" : waifu.rating == UserRating.BODYBAG ? "Bodybag" : "Unknown"));

        Gallery.app.get('/gallery/' + user.userID, (req, res) => {
            fs.readFile("./web/index.html", 'utf8', (err: any, data: string) => {
                if (err) return res.status(500).send(err);
                let lines = data.split('\n')

                let waifuRow = lines.findIndex(line => line.includes("waifurow"))
                let start = lines.slice(0, waifuRow + 1)
                let end = lines.slice(waifuRow + 1, lines.length)

                start.push(...mongoWaifus.map(waifu => this.card
                    .replace("imageURL", waifu.waifu.url)
                    .replace("waifucard", waifu.waifu.rating == Rating.SAFE ? "waifucard" : "waifucard explicit")
                    .replace("rating", waifu.rating == UserRating.MOMMY ? "Mommy" : waifu.rating == UserRating.SMASH ? "Smash" : waifu.rating == UserRating.PASS ? "Pass" : waifu.rating == UserRating.BODYBAG ? "Bodybag" : "Unknown")
                ));
                const modifiedHtml = start.join('\n').replace('userName', discordUser.displayName).replace("waifuData", JSON.stringify(htmlWaifus)) + end.join('\n');

                res.send(modifiedHtml);
            });
        })

        const embed = new EmbedBuilder()
            .setTitle(`${discordUser.username}'s Gallery`)
            .setColor(Colors.Blue)
            .setDescription(`You have **${mongoWaifus.length}** waifus in your gallery.`)
            .setThumbnail(discordUser.displayAvatarURL())
            .setFooter({ text: `Use /waifu to add more waifus!` });
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("View Gallery")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`http://panel.wolf-co.com:${25551}/gallery/${discordUser.id}`)
            );


        interaction.editReply({ embeds: [embed], components: [row] });
        return;
    }
}

module.exports = new Gallery();

class HTMLWaifu {
    imageURL: string;
    class: string;
    rating: string;

    constructor(imageURL: string, className: string, rating: string) {
        this.imageURL = imageURL;
        this.class = className;
        this.rating = rating;
    }
}

class UserWaifu {
    public waifu: Waifu;
    public rating: UserRating;

    constructor(waifu: Waifu, rating: UserRating) {
        this.waifu = waifu;
        this.rating = rating;
    }
}