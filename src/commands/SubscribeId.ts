import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, Client, Interaction, MessageInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import IGDBApi from "../api/IGDBApi";
import DiscordBot from "../classes/Bot";
import CustomIdentifier from "../classes/CustomIdentifier";
import { Game } from "../api/IGDB";
import { SubscribeOptionPayload } from "./Subscribe";

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
        let game = await IGDBApi.getGameById(parseInt(id));
        if (!game) return await interaction.editReply("Geen game gevonden met dit ID.");
        
        game = await this.enrichGameAndSave(game, interaction.guildId ?? "", userDescription)
        if (!game) return await interaction.editReply("Er is iets fout gegaan. Probeer later opnieuw.");
        const gameInData = await DiscordBot.getInstance().dataHandlers.gameSubscriptions.getItem(interaction.guildId ?? "", game.id);
        gameInData ? await interaction.editReply(`${game.name} is geupdatet.`)
            : await interaction.editReply(`Je hebt ${game.name} toegevoegd.`);
    }

    async onButtonPress(interaction: ButtonInteraction<CacheType>): Promise<void> {
        interaction.update({ content: `Aan het toevoegen...`, components: []});
        try {
            let game = CustomIdentifier.fromCustomId<SubscribeOptionPayload>(interaction.customId).payload as Game
            game = await IGDBApi.getGameById(game.id) as Game
            await this.enrichGameAndSave(game, interaction.guildId ?? "", game?.userDescription)
            interaction.editReply({ content: `${game.name} is toegevoegd.` });
        } catch (error) {
            console.error(error)
            interaction.editReply({ content: "Er is iets fout gegaan. Probeer later opnieuw." });
        }
    }

    async enrichGameAndSave(game: Game, guildId: string, userDescription?: string | null): Promise<Game> {
        game = await IGDBApi.enrichGameData(game)
        if (userDescription) game.userDescription = userDescription;
        const games = await DiscordBot.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(guildId) as Game[];
        const index = games.findIndex(g => g.id === game.id);
        if (index !== -1) games[index] = {
            ...games[index],
            ...game
        };
        else games.push(game);
        DiscordBot.getInstance().dataHandlers.gameSubscriptions.overwrite(guildId, games)
        DiscordBot.getInstance().getServerById(guildId)?.refreshLiveMessages();
        return game;
    }


}
