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
    onCommand(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const name = interaction.options.getString("name", true);
                let subscribed = true;
                const games = yield Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer((_a = interaction.guildId) !== null && _a !== void 0 ? _a : "");
                let game = games.find(game => game.name.toLowerCase() == name.toLowerCase());
                if (!game) {
                    game = yield IGDBApi_1.default.searchGame(name);
                    subscribed = false;
                }
                game = game;
                const coverUrl = (yield IGDBApi_1.default.searchGameCover(game.cover));
                const embed = {
                    title: game.name,
                    fields: [
                        {
                            name: "Status",
                            value: IGDB_1.default.statusToString((_b = game === null || game === void 0 ? void 0 : game.currentReleaseStatus) !== null && _b !== void 0 ? _b : 0)
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
                            value: (_c = game === null || game === void 0 ? void 0 : game.userDescription) !== null && _c !== void 0 ? _c : ""
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
                yield interaction.reply({ embeds: [embed], ephemeral: true });
            }
            catch (error) {
                console.log(error);
                interaction.reply({ content: `Er is iets fout gegaan. ${error}`, ephemeral: true });
            }
        });
    }
}
exports.default = Release;
