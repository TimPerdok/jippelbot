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
const Bot_1 = __importDefault(require("../classes/Bot"));
const CustomIdentifier_1 = __importDefault(require("../classes/CustomIdentifier"));
class Subscribe extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("id").setDescription("De id van de game").setRequired(true))
            .addStringOption(option => option.setName("description").setDescription("Een beschrijving van de game").setRequired(false));
    }
    constructor() {
        super("subscribeid", "Voeg een game toe met een id om naar uit te kijken.");
    }
    onCommand(interaction) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const id = interaction.options.getString("id", true);
            const userDescription = interaction.options.getString("description", false);
            yield interaction.deferReply({ ephemeral: true });
            let game = yield IGDBApi_1.default.getGameById(parseInt(id));
            if (!game)
                return yield interaction.editReply("Geen game gevonden met dit ID.");
            game = yield this.enrichGameAndSave(game, (_a = interaction.guildId) !== null && _a !== void 0 ? _a : "", userDescription);
            if (!game)
                return yield interaction.editReply("Er is iets fout gegaan. Probeer later opnieuw.");
            const gameInData = yield Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getItem((_b = interaction.guildId) !== null && _b !== void 0 ? _b : "", game.id);
            gameInData ? yield interaction.editReply(`${game.name} is geupdatet.`)
                : yield interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
            (_d = Bot_1.default.getInstance().getServerById((_c = interaction.guildId) !== null && _c !== void 0 ? _c : "")) === null || _d === void 0 ? void 0 : _d.rescheduleGameReleases();
        });
    }
    onButtonPress(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            interaction.update({ content: `Aan het toevoegen...`, components: [] });
            try {
                let game = CustomIdentifier_1.default.fromCustomId(interaction.customId).payload;
                game = (yield IGDBApi_1.default.getGameById(game.id));
                yield this.enrichGameAndSave(game, (_a = interaction.guildId) !== null && _a !== void 0 ? _a : "", game === null || game === void 0 ? void 0 : game.userDescription);
                interaction.editReply({ content: `${game.name} is toegevoegd.` });
            }
            catch (error) {
                console.error(error);
                interaction.editReply({ content: "Er is iets fout gegaan. Probeer later opnieuw." });
            }
        });
    }
    enrichGameAndSave(game, guildId, userDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            game = yield IGDBApi_1.default.enrichGameData(game);
            if (userDescription)
                game.userDescription = userDescription;
            // await JSONDataHandler.addGameSubscription(guildId, game);
            return game;
        });
    }
}
exports.default = Subscribe;
