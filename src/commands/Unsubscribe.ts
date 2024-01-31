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
        super("unsubscribe", "Verwijder een game om naar uit te kijken.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString("name", true);
        interaction.deferReply();
        const game = await DataHandler.removeGameSubscription(interaction.guildId ?? "", name);
        if (!game) return await interaction.editReply("De server was niet geabonneerd op deze game.");
        await interaction.editReply(`De server is niet meer geabonneerd op ${game.name}.`);
    }

}
