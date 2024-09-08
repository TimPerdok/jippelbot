"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const IGDBApi_1 = __importDefault(require("../api/IGDBApi"));
const IGDB_1 = __importDefault(require("../api/IGDB"));
const Bot_1 = __importDefault(require("../classes/Bot"));
class Release extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true));
    }
    constructor() {
        super("release", "Bekijk het profiel van een game.");
    }
    async onCommand(interaction) {
        try {
            const name = interaction.options.getString("name", true);
            let subscribed = true;
            const games = await Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(interaction.guildId ?? "");
            let game = games.find(game => game.name.toLowerCase() == name.toLowerCase());
            if (!game) {
                game = await IGDBApi_1.default.searchGame(name);
                subscribed = false;
            }
            game = game;
            const coverUrl = (await IGDBApi_1.default.searchGameCover(game.cover));
            const embed = {
                title: game.name,
                fields: [
                    {
                        name: "Status",
                        value: IGDB_1.default.statusToString(game?.currentReleaseStatus ?? 0)
                    },
                    {
                        name: "Volgende release datum",
                        value: game.nextReleaseDate ?
                            `<t:${Math.round(game.nextReleaseDate)}:R>`
                            : "Geen datum bekend"
                    },
                    {
                        name: "Volgende release status",
                        value: game.nextReleaseStatus ?
                            IGDB_1.default.statusToString(game.nextReleaseStatus)
                            : "Geen status bekend"
                    },
                    {
                        name: "Omschrijving",
                        value: game?.userDescription ?? ""
                    },
                    {
                        name: "Subscribed",
                        value: subscribed ? "Ja" : "Nee"
                    }
                ],
                url: game.url,
                thumbnail: {
                    url: `https:${coverUrl}`
                }
            };
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        catch (error) {
            console.log(error);
            interaction.reply({ content: `Er is iets fout gegaan. ${error}`, ephemeral: true });
        }
    }
}
exports.default = Release;
