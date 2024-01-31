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
class Subscribe extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
    constructor() {
        super("releases", "Laat de toegevoegde upcoming game releases zien");
    }
    onCommand(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let games = yield DataHandler_1.default.getGameSubscriptions((_a = interaction.guildId) !== null && _a !== void 0 ? _a : "");
                games = games === null || games === void 0 ? void 0 : games.sort((a, b) => {
                    if (!a.nextReleaseDate && !b.nextReleaseDate)
                        return 0;
                    if (!a.nextReleaseDate)
                        return 1;
                    if (!b.nextReleaseDate)
                        return -1;
                    return a.nextReleaseDate - b.nextReleaseDate;
                });
                if (!(games === null || games === void 0 ? void 0 : games.length))
                    return yield interaction.reply("Er zijn nog geen games toegevoegd.");
                const embed = {
                    title: "Upcoming game releases",
                    fields: games.map((game, index) => {
                        var _a, _b, _c;
                        const date = new Date(((_a = game === null || game === void 0 ? void 0 : game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
                        const status = (game === null || game === void 0 ? void 0 : game.currentReleaseStatus) != undefined
                            ? `(${IGDBApi_1.default.statusToString((_b = game.currentReleaseStatus) !== null && _b !== void 0 ? _b : 0)})`
                            : "";
                        return {
                            name: `${++index}. ${game.name} ${status}`,
                            value: game.nextReleaseDate ?
                                `${IGDBApi_1.default.statusToString((_c = game === null || game === void 0 ? void 0 : game.nextReleaseStatus) !== null && _c !== void 0 ? _c : 0)} op <t:${Math.round(date.getTime() / 1000)}>
                            <t:${Math.round(date.getTime() / 1000)}:R>`
                                : "Geen datum bekend"
                        };
                    }),
                };
                yield interaction.reply({ embeds: [embed] });
            }
            catch (error) {
                interaction.reply(`Er is iets fout gegaan. ${error}`);
            }
        });
    }
}
exports.default = Subscribe;
