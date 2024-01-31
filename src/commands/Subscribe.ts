import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi from "../api/IGDBApi";

export default class Subscribe extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true)) as SlashCommandBuilder;
    }

    constructor() {
        super("subscribe", "Voeg een game toe om naar uit te kijken.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString("name", true);

        const gameInData = await DataHandler.getGameSubscription(interaction.guildId ?? "", name);
        if (gameInData) return await interaction.reply("Deze game is al toegevoegd.");

        interaction.deferReply();

        const game = await IGDBApi.searchGame(name);
        if (!game) return await interaction.editReply("Geen game gevonden met deze naam die nog uit moet komen.");
        await DataHandler.addGameSubscription(interaction.guildId ?? "", game);
        await interaction.editReply(`Je hebt de server geabonneerd op ${game.name}.`);
    }

}
