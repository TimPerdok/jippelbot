import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import IGDBApi from "../api/IGDBApi";
import DiscordBot from "../classes/Bot";
import { Game } from "../api/IGDB";

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
        const games = DiscordBot.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(interaction.guildId ?? "")
        const newGames = games.filter((game: Game) => game.name.toLowerCase() !== name.toLowerCase());
        const deletedGame = games.find((game: Game) => game.name.toLowerCase() === name.toLowerCase())
        DiscordBot.getInstance().dataHandlers.gameSubscriptions.overwrite(interaction.guildId ?? "", newGames);
        if (!deletedGame) return await interaction.reply({content: `De server is niet geabonneerd op ${name}.`, ephemeral: true})
        await interaction.reply({content: `De server is niet meer geabonneerd op ${deletedGame.name}.`, ephemeral: true});
        DiscordBot.getInstance().getServerById(interaction.guildId ?? "")?.refreshLiveMessages();
    }

}
