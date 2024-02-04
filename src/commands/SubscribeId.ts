import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Client, Interaction, MessageInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi, { Game } from "../api/IGDBApi";
import DiscordBot from "../classes/Bot";
import CustomIdentifier from "../classes/CustomIdentifier";

export default class Subscribe extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("id").setDescription("De id van de game").setRequired(true))
            .addStringOption(option => option.setName("description").setDescription("Een beschrijving van de game").setRequired(false)) as SlashCommandBuilder;
    }

    constructor() {
        super("subscribeid", "Voeg een game toe met een id om naar uit te kijken.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const id = interaction.options.getString("id", true);
        const userDescription = interaction.options.getString("description", false);
        
        await interaction.deferReply({ ephemeral: true });
        let game: Game = await IGDBApi.getGameById(parseInt(id));
        if (!game) return await interaction.editReply("Geen game gevonden met dit ID.");
        
        game = await this.enrichGameAndSave(game, interaction.guildId, userDescription)
        const gameInData = await DataHandler.getGameSubscription(interaction.guildId ?? "", game.name);
        gameInData ? await interaction.editReply(`${game.name} is geupdatet.`)
            : await interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
        await DiscordBot.updateMessages()
    }

    async onButtonPress(interaction: ButtonInteraction<CacheType>): Promise<void> {
        interaction.update({ content: `Aan het toevoegen...`, components: []});
        try {
            let game = CustomIdentifier.fromCustomId<Game>(interaction.customId)
            game = await IGDBApi.getGameById(game.id);
            await this.enrichGameAndSave(game, interaction.guildId, game?.userDescription)
            interaction.editReply({ content: `${game.name} is toegevoegd.` });
        } catch (error) {
            interaction.editReply({ content: "Er is iets fout gegaan. Probeer later opnieuw." });
        }
    }

    async enrichGameAndSave(game: Game, guildId: string, userDescription?: string): Promise<Game> {
        game = await IGDBApi.enrichGameData(game);
        game.userDescription = userDescription;
        await DataHandler.addGameSubscription(guildId, game);
        return game;
    }


}
