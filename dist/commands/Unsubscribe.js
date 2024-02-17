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
const Bot_1 = __importDefault(require("../classes/Bot"));
class Subscribe extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true));
    }
    constructor() {
        super("unsubscribe", "Verwijder een game om naar uit te kijken.");
    }
    onCommand(interaction) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const name = interaction.options.getString("name", true);
            const games = Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer((_a = interaction.guildId) !== null && _a !== void 0 ? _a : "");
            const newGames = games.filter((game) => game.name.toLowerCase() !== name.toLowerCase());
            const deletedGame = games.find((game) => game.name.toLowerCase() === name.toLowerCase());
            Bot_1.default.getInstance().dataHandlers.gameSubscriptions.overwrite((_b = interaction.guildId) !== null && _b !== void 0 ? _b : "", newGames);
            if (!deletedGame)
                return yield interaction.reply({ content: `De server is niet geabonneerd op ${name}.`, ephemeral: true });
            yield interaction.reply({ content: `De server is niet meer geabonneerd op ${deletedGame.name}.`, ephemeral: true });
            (_d = Bot_1.default.getInstance().getServerById((_c = interaction.guildId) !== null && _c !== void 0 ? _c : "")) === null || _d === void 0 ? void 0 : _d.updateLiveMessages();
        });
    }
}
exports.default = Subscribe;
