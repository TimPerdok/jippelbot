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
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true))
            .addStringOption(option => option.setName("description").setDescription("Een beschrijving van de game").setRequired(false));
    }
    constructor() {
        super("subscribe", "Voeg een game toe om naar uit te kijken.");
    }
    onCommand(interaction) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const name = interaction.options.getString("name", true);
            const userDescription = interaction.options.getString("description", false);
            yield interaction.deferReply({ ephemeral: true });
            const options = yield IGDBApi_1.default.presearchGame(name);
            if (!(options === null || options === void 0 ? void 0 : options.length))
                return yield interaction.editReply("Geen game gevonden met deze naam.");
            const actionRow = new discord_js_1.ActionRowBuilder()
                .addComponents(options
                .slice(0, 5)
                .sort((a, b) => { var _a, _b; return ((_a = b.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) - ((_b = a.nextReleaseDate) !== null && _b !== void 0 ? _b : 0); })
                .map(option => new discord_js_1.ButtonBuilder()
                .setCustomId(CustomIdentifier_1.default.toCustomId({
                command: this.name,
                payload: Object.assign({ id: option.id }, (userDescription && { userDescription }))
            }))
                .setLabel(`${option.name} ${(option === null || option === void 0 ? void 0 : option.nextReleaseDate) ? `(${new Date((option === null || option === void 0 ? void 0 : option.nextReleaseDate) * 1000).toLocaleDateString()})` : ""}`)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(false)));
            if (options.length > 1)
                return yield interaction.editReply({
                    components: [actionRow],
                });
            const game = yield this.enrichGameAndSave(options[0], (_a = interaction.guildId) !== null && _a !== void 0 ? _a : "", userDescription);
            const gameInData = yield Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer((_b = interaction.guildId) !== null && _b !== void 0 ? _b : "");
            gameInData ? yield interaction.editReply(`${game.name} is geupdatet.`)
                : yield interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
            (_d = Bot_1.default.getInstance().getServerById((_c = interaction.guildId) !== null && _c !== void 0 ? _c : "")) === null || _d === void 0 ? void 0 : _d.refreshLiveMessages();
        });
    }
    onButtonPress(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            interaction.update({ content: `Aan het toevoegen...`, components: [] });
            try {
                let game = (_a = CustomIdentifier_1.default.fromCustomId(interaction.customId)) === null || _a === void 0 ? void 0 : _a.payload;
                game = (yield IGDBApi_1.default.getGameById(game.id));
                yield this.enrichGameAndSave(game, (_b = interaction.guildId) !== null && _b !== void 0 ? _b : "", game === null || game === void 0 ? void 0 : game.userDescription);
                interaction.editReply({ content: `${game.name} is toegevoegd.` });
            }
            catch (error) {
                console.error(error);
                interaction.editReply({ content: "Er is iets fout gegaan. Probeer later opnieuw." });
            }
        });
    }
    enrichGameAndSave(game, guildId, userDescription) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            game = yield IGDBApi_1.default.enrichGameData(game);
            if (userDescription)
                game.userDescription = userDescription;
            const games = yield Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(guildId);
            const index = games.findIndex(g => g.id === game.id);
            if (index !== -1)
                games[index] = Object.assign(Object.assign({}, games[index]), game);
            else
                games.push(game);
            yield Bot_1.default.getInstance().dataHandlers.gameSubscriptions.overwrite(guildId, games);
            (_a = Bot_1.default.getInstance().getServerById(guildId)) === null || _a === void 0 ? void 0 : _a.refreshLiveMessages();
            return game;
        });
    }
}
exports.default = Subscribe;
