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
const IGDBApi_1 = __importDefault(require("../api/IGDBApi"));
class ReleaseList extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
    constructor() {
        super("releases", "Laat alle upcoming game releases zien");
    }
    uniqueArray(array) {
        return array.filter((obj, index, self) => index === self.findIndex((o) => o.key === obj.key));
    }
    onCommand(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let games = yield DataHandler_1.default.getGameSubscriptions((_a = interaction.guildId) !== null && _a !== void 0 ? _a : "");
                if (!(games === null || games === void 0 ? void 0 : games.length))
                    return yield interaction.reply({ content: "Er zijn nog geen games toegevoegd.", ephemeral: true });
                const months = [...new Set(this.uniqueArray(games
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
                    return {
                        name: this.uppercaseFirstLetter(month.toLocaleString("nl-NL", { month: "long", year: "numeric" })),
                        value: gamesOfMonth.map((game) => this.toValue(game)).join("\n"),
                    };
                });
                const unknownDateField = {
                    name: "Onbekend",
                    value: games
                        .filter(game => (game === null || game === void 0 ? void 0 : game.nextReleaseDate) == undefined)
                        .map(game => this.toValue(game)).join("\n"),
                };
                fields.push(unknownDateField);
                const embed = {
                    title: "Upcoming game releases",
                    fields
                };
                yield interaction.reply({ embeds: [embed] });
            }
            catch (error) {
                interaction.reply(`Er is iets fout gegaan. ${error}`);
            }
        });
    }
    toValue(game) {
        var _a, _b;
        const date = new Date(((_a = game === null || game === void 0 ? void 0 : game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
        const status = (game === null || game === void 0 ? void 0 : game.currentReleaseStatus) != undefined
            ? `(${IGDBApi_1.default.statusToString((_b = game.currentReleaseStatus) !== null && _b !== void 0 ? _b : 0)})`
            : "";
        return `- [${game.name}](${game.url}) ${status}
            ${(game === null || game === void 0 ? void 0 : game.nextReleaseDate) ?
            `<t:${Math.round(date.getTime() / 1000)}:R>`
            : ""}
                ${(game === null || game === void 0 ? void 0 : game.userDescription) ?
            `  - ${game.userDescription}` : ""}`;
    }
    uppercaseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
exports.default = ReleaseList;
