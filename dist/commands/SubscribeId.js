"use strict";
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
    async onCommand(interaction) {
        const id = interaction.options.getString("id", true);
        const userDescription = interaction.options.getString("description", false);
        await interaction.deferReply({ ephemeral: true });
        let game = await IGDBApi_1.default.getGameById(parseInt(id));
        if (!game)
            return await interaction.editReply("Geen game gevonden met dit ID.");
        game = await this.enrichGameAndSave(game, interaction.guildId ?? "", userDescription);
        if (!game)
            return await interaction.editReply("Er is iets fout gegaan. Probeer later opnieuw.");
        const gameInData = await Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getItem(interaction.guildId ?? "", game.id);
        gameInData ? await interaction.editReply(`${game.name} is geupdatet.`)
            : await interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
    }
    async onButtonPress(interaction) {
        interaction.update({ content: `Aan het toevoegen...`, components: [] });
        try {
            let game = CustomIdentifier_1.default.fromCustomId(interaction.customId).payload;
            game = await IGDBApi_1.default.getGameById(game.id);
            await this.enrichGameAndSave(game, interaction.guildId ?? "", game?.userDescription);
            interaction.editReply({ content: `${game.name} is toegevoegd.` });
        }
        catch (error) {
            console.error(error);
            interaction.editReply({ content: "Er is iets fout gegaan. Probeer later opnieuw." });
        }
    }
    async enrichGameAndSave(game, guildId, userDescription) {
        game = await IGDBApi_1.default.enrichGameData(game);
        if (userDescription)
            game.userDescription = userDescription;
        const games = await Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(guildId);
        const index = games.findIndex(g => g.id === game.id);
        if (index !== -1)
            games[index] = {
                ...games[index],
                ...game
            };
        else
            games.push(game);
        Bot_1.default.getInstance().dataHandlers.gameSubscriptions.overwrite(guildId, games);
        Bot_1.default.getInstance().getServerById(guildId)?.refreshLiveMessages();
        return game;
    }
}
exports.default = Subscribe;
