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
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true))
            .addStringOption(option => option.setName("description").setDescription("Een beschrijving van de game").setRequired(false));
    }
    constructor() {
        super("subscribe", "Voeg een game toe om naar uit te kijken.");
    }
    async onCommand(interaction) {
        const name = interaction.options.getString("name", true);
        const userDescription = interaction.options.getString("description", false);
        await interaction.deferReply({ ephemeral: true });
        const options = await IGDBApi_1.default.presearchGame(name);
        if (!options?.length)
            return await interaction.editReply("Geen game gevonden met deze naam.");
        const actionRow = new discord_js_1.ActionRowBuilder()
            .addComponents(options
            .slice(0, 5)
            .sort((a, b) => (b.nextReleaseDate ?? 0) - (a.nextReleaseDate ?? 0))
            .map(option => new discord_js_1.ButtonBuilder()
            .setCustomId(CustomIdentifier_1.default.toCustomId({
            command: this.name,
            payload: {
                id: option.id,
                ...(userDescription && { userDescription })
            }
        }))
            .setLabel(`${option.name} ${option?.nextReleaseDate ? `(${new Date((option?.nextReleaseDate) * 1000).toLocaleDateString()})` : ""}`)
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(false)));
        if (options.length > 1)
            return await interaction.editReply({
                components: [actionRow],
            });
        const game = await this.enrichGameAndSave(options[0], interaction.guildId ?? "", userDescription);
        const gameInData = await Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(interaction.guildId ?? "");
        gameInData ? await interaction.editReply(`${game.name} is geupdatet.`)
            : await interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
        Bot_1.default.getInstance().getServerById(interaction.guildId ?? "")?.refreshLiveMessages();
    }
    async onButtonPress(interaction) {
        interaction.update({ content: `Aan het toevoegen...`, components: [] });
        try {
            let game = CustomIdentifier_1.default.fromCustomId(interaction.customId)?.payload;
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
        await Bot_1.default.getInstance().dataHandlers.gameSubscriptions.overwrite(guildId, games);
        Bot_1.default.getInstance().getServerById(guildId)?.refreshLiveMessages();
        return game;
    }
}
exports.default = Subscribe;
