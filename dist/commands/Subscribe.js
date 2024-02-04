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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const name = interaction.options.getString("name", true);
            const userDescription = interaction.options.getString("description", false);
            yield interaction.deferReply({ ephemeral: true });
            const options = yield IGDBApi_1.default.presearchGame(name);
            if (!(options === null || options === void 0 ? void 0 : options.length))
                return yield interaction.editReply("Geen game gevonden met deze naam.");
            const actionRow = new discord_js_1.ActionRowBuilder()
                .addComponents(options.map(option => new discord_js_1.ButtonBuilder()
                .setCustomId(CustomIdentifier_1.default.toCustomId(Object.assign({ id: option.id }, (userDescription && { userDescription }))))
                .setLabel(option.name)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(false)));
            console.log(options.map(option => CustomIdentifier_1.default.toCustomId(Object.assign({ id: option.id }, (userDescription && { userDescription })))));
            if (options.length > 1)
                return yield interaction.editReply({
                    components: [actionRow],
                });
            const game = yield this.enrichGameAndSave(options[0], interaction.guildId, userDescription);
            const gameInData = yield DataHandler_1.default.getGameSubscription((_a = interaction.guildId) !== null && _a !== void 0 ? _a : "", game.name);
            gameInData ? yield interaction.editReply(`${game.name} is geupdatet.`)
                : yield interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
            yield Bot_1.default.updateMessages();
        });
    }
    onButtonPress(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            interaction.update({ content: `Aan het toevoegen...`, components: [] });
            try {
                let game = CustomIdentifier_1.default.fromCustomId(interaction.customId);
                game = yield IGDBApi_1.default.getGameById(game.id);
                yield this.enrichGameAndSave(game, interaction.guildId, game === null || game === void 0 ? void 0 : game.userDescription);
                interaction.editReply({ content: `${game.name} is toegevoegd.` });
            }
            catch (error) {
                interaction.editReply({ content: "Er is iets fout gegaan. Probeer later opnieuw." });
            }
        });
    }
    enrichGameAndSave(game, guildId, userDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            game = yield IGDBApi_1.default.enrichGameData(game);
            game.userDescription = userDescription;
            yield DataHandler_1.default.addGameSubscription(guildId, game);
            return game;
        });
    }
}
exports.default = Subscribe;
