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
            .setDescription(this.description)
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true));
    }
    constructor() {
        super("release", "Bekijk het profiel van een game.");
    }
    onCommand(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const name = interaction.options.getString("name", true);
                let subscribed = true;
                let game = (yield DataHandler_1.default.getGameSubscriptions((_a = interaction.guildId) !== null && _a !== void 0 ? _a : ""))
                    .find(game => game.name.toLowerCase() == name.toLowerCase());
                if (!game) {
                    game = yield IGDBApi_1.default.searchGame(name);
                    subscribed = false;
                }
                const coverUrl = (yield IGDBApi_1.default.searchGameCover(game.cover));
                const embed = {
                    title: game.name,
                    fields: [
                        {
                            name: "Status",
                            value: IGDBApi_1.default.statusToString((_b = game === null || game === void 0 ? void 0 : game.currentReleaseStatus) !== null && _b !== void 0 ? _b : 0)
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
                                IGDBApi_1.default.statusToString(game.nextReleaseStatus)
                                : "Geen status bekend"
                        },
                        {
                            name: "Omschrijving",
                            value: game === null || game === void 0 ? void 0 : game.userDescription
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
                interaction.reply({ content: `Er is iets fout gegaan. ${error}`, ephemeral: true });
            }
        });
    }
}
exports.default = Subscribe;
