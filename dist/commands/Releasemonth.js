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
const Command_1 = __importDefault(require("../classes/Command"));
const DataHandler_1 = __importDefault(require("../classes/datahandlers/DataHandler"));
const util_1 = require("../util/util");
class ReleaseMonth extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("month").setDescription("Een maand").setRequired(true).setChoices(...util_1.MONTHS.map(month => ({ name: month, value: month }))))
            .addNumberOption(option => option.setName("year").setDescription("Een jaar").setRequired(false));
    }
    constructor() {
        super("releasemonth", "Bekijk een maand met releases.");
    }
    onCommand(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const month = interaction.options.getString("month", true);
                const year = (_a = interaction.options.getNumber("year", false)) !== null && _a !== void 0 ? _a : new Date().getFullYear();
                let games = (yield DataHandler_1.default.getGameSubscriptions((_b = interaction.guildId) !== null && _b !== void 0 ? _b : ""))
                    .filter(game => { var _a, _b; return (game === null || game === void 0 ? void 0 : game.nextReleaseDate) != undefined && new Date(((_a = game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000).getMonth() == util_1.MONTHS.indexOf(month) && new Date(((_b = game.nextReleaseDate) !== null && _b !== void 0 ? _b : 0) * 1000).getFullYear() == year; });
                if (!(games === null || games === void 0 ? void 0 : games.length))
                    return yield interaction.reply({ content: "Deze maand heeft nog geen releases", ephemeral: true });
                const months = [...new Set((0, util_1.uniqueArray)(games
                        .filter(game => (game === null || game === void 0 ? void 0 : game.nextReleaseDate) != undefined)
                        .map(game => new Date((game.nextReleaseDate) * 1000))
                        .map(date => ({
                        key: `${date.getMonth()}-${date.getFullYear()}`,
                        value: date
                    }))))]
                    .map(month => month.value)
                    .sort((a, b) => a.getTime() - b.getTime());
                let fields = [...months].map(month => {
                    const gamesOfMonth = games.filter(game => {
                        var _a;
                        const date = new Date(((_a = game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
                        return date.getMonth() == month.getMonth() && date.getFullYear() == month.getFullYear();
                    });
                    let exceededCount = 0;
                    const truncated = [];
                    gamesOfMonth.forEach((game) => {
                        if (truncated.join("\n").length > 1000)
                            return exceededCount++;
                        truncated.push((0, util_1.gameToValue)(game));
                    });
                    if (exceededCount > 0)
                        truncated.push(`& ${exceededCount} meer`);
                    return {
                        name: (0, util_1.uppercaseFirstLetter)(month.toLocaleString("nl-NL", { month: "long", year: "numeric" })),
                        value: truncated.join("\n"),
                        inline: false
                    };
                });
                const embed = {
                    title: `Releases`,
                    fields
                };
                yield interaction.reply({ embeds: [embed], ephemeral: true });
            }
            catch (error) {
                interaction.reply(`Er is iets fout gegaan. ${error}`);
            }
        });
    }
}
exports.default = ReleaseMonth;
