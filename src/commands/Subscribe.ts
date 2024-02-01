import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi from "../api/IGDBApi";

export default class Subscribe extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true))
            .addStringOption(option => option.setName("description").setDescription("Een beschrijving van de game").setRequired(false)) as SlashCommandBuilder;
    }

    constructor() {
        super("subscribe", "Voeg een game toe om naar uit te kijken.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString("name", true);
        const userDescription = interaction.options.getString("description", false);

        interaction.deferReply();

        const game = await IGDBApi.searchGame(name);
        if (!game) return await interaction.editReply("Geen game gevonden met deze naam die nog uit moet komen.");

        game.userDescription = userDescription;
        await DataHandler.addGameSubscription(interaction.guildId ?? "", game);
        const gameInData = await DataHandler.getGameSubscription(interaction.guildId ?? "", name);
        return gameInData ? await interaction.editReply("De game is geupdatet.")
            : await interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
    }

}
