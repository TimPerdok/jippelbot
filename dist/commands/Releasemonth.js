"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Bot_1 = __importDefault(require("../classes/Bot"));
const Command_1 = __importDefault(require("../classes/Command"));
const Constants_1 = require("../Constants");
const GameReleaseEmbedBuilder_1 = __importDefault(require("../util/GameReleaseEmbedBuilder"));
class ReleaseMonth extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("month").setDescription("Een maand").setRequired(true).setChoices(...Constants_1.MONTHS.map(month => ({ name: month, value: month })), { name: "Onbekend", value: "Onbekend" }))
            .addNumberOption(option => option.setName("year").setDescription("Een jaar").setRequired(false));
    }
    constructor() {
        super("releasemonth", "Bekijk een maand met releases.");
    }
    async onCommand(interaction) {
        try {
            const month = interaction.options.getString("month", true);
            const year = interaction.options.getNumber("year", false) ?? new Date().getFullYear();
            let games = await Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(interaction.guildId ?? "");
            games = month === "Onbekend" ? games.filter(game => game?.nextReleaseDate == undefined)
                : games.filter(game => game?.nextReleaseDate != undefined && new Date((game.nextReleaseDate ?? 0) * 1000).getMonth() == Constants_1.MONTHS.indexOf(month) && new Date((game.nextReleaseDate ?? 0) * 1000).getFullYear() == year);
            if (!games?.length)
                return await interaction.reply({ content: "Deze maand heeft nog geen releases", ephemeral: true });
            const embed = GameReleaseEmbedBuilder_1.default.createEmbed(games, true);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        catch (error) {
            interaction.reply({ content: `Er is iets fout gegaan. ${error}`, ephemeral: true });
        }
    }
}
exports.default = ReleaseMonth;
