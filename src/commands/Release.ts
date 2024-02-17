import { ChatInputCommandInteraction, Client, Embed, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import JSONDataHandler from "../classes/datahandlers/JSONDataHandler";
import IGDBApi from "../api/IGDBApi";
import IGDB, { Game } from "../api/IGDB";
import DiscordBot from "../classes/Bot";

export default class Subscribe extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("name").setDescription("De naam van de game").setRequired(true)) as SlashCommandBuilder;
    }

    constructor() {
        super("release", "Bekijk het profiel van een game.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            const name = interaction.options.getString("name", true);
            let subscribed = true;
            const games = await DiscordBot.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(interaction.guildId ?? "") as Game[];
            let game = games.find(game => game.name.toLowerCase() == name.toLowerCase());
            if (!game) {
                game = await IGDBApi.searchGame(name);
                subscribed = false;
            }
            game = game as Game;
            const coverUrl = (await IGDBApi.searchGameCover(game.cover))
            const embed = {
                title: game.name,
                fields: [
                    {
                        name: "Status",
                        value: IGDB.statusToString(game?.currentReleaseStatus ?? 0)
                    },
                    {
                        name: "Volgende release datum",
                        value: game.nextReleaseDate ?
                            `<t:${Math.round(game.nextReleaseDate)}:R>`
                            : "Geen datum bekend"
                    },
                    {
                        name: "Volgende release status",
                        value: game.nextReleaseStatus ?
                            IGDB.statusToString(game.nextReleaseStatus)
                            : "Geen status bekend"
                    },
                    {
                        name: "Omschrijving",
                        value: game?.userDescription ?? ""
                    },
                    {
                        name: "Subscribed",
                        value: subscribed ? "Ja" : "Nee"
                    }
                ],
                url: game.url,
                thumbnail: {
                    url: `https:${coverUrl}`
                }
            } as Embed;
            await interaction.reply({ embeds: [embed], ephemeral: true});    
        } catch (error) {
            console.log(error)
            interaction.reply({content: `Er is iets fout gegaan. ${error}`, ephemeral: true});
        }
        
    }

}
