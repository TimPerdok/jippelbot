"use strict";
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
    async onCommand(interaction) {
        const name = interaction.options.getString("name", true);
        const games = Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(interaction.guildId ?? "");
        const newGames = games.filter((game) => game.name.toLowerCase() !== name.toLowerCase());
        const deletedGame = games.find((game) => game.name.toLowerCase() === name.toLowerCase());
        Bot_1.default.getInstance().dataHandlers.gameSubscriptions.overwrite(interaction.guildId ?? "", newGames);
        if (!deletedGame)
            return await interaction.reply({ content: `De server is niet geabonneerd op ${name}.`, ephemeral: true });
        await interaction.reply({ content: `De server is niet meer geabonneerd op ${deletedGame.name}.`, ephemeral: true });
        Bot_1.default.getInstance().getServerById(interaction.guildId ?? "")?.refreshLiveMessages();
    }
}
exports.default = Subscribe;
