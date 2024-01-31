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
        super("subscribe", "Voeg een game toe om naar uit te kijken.");
    }
    onCommand(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const name = interaction.options.getString("name", true);
            const gameInData = yield DataHandler_1.default.getGameSubscription((_a = interaction.guildId) !== null && _a !== void 0 ? _a : "", name);
            if (gameInData)
                return yield interaction.reply("Deze game is al toegevoegd.");
            interaction.deferReply();
            const game = yield IGDBApi_1.default.searchGame(name);
            if (!game)
                return yield interaction.editReply("Geen game gevonden met deze naam die nog uit moet komen.");
            yield DataHandler_1.default.addGameSubscription((_b = interaction.guildId) !== null && _b !== void 0 ? _b : "", game);
            yield interaction.editReply(`Je hebt de server geabonneerd op ${game.name}.`);
        });
    }
}
exports.default = Subscribe;