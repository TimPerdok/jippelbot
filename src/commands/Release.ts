import { ChatInputCommandInteraction, Client, Embed, SlashCommandBuilder } from "discord.js";
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
        super("release", "Bekijk het profiel van een game.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            const name = interaction.options.getString("name", true);
            const game = (await DataHandler.getGameSubscriptions(interaction.guildId ?? ""))
                .find(game => game.name.toLowerCase() == name.toLowerCase());
            if (!game) return await interaction.reply("Geen game gevonden met deze naam.");
            const coverUrl = (await IGDBApi.searchGameCover(game.cover))
            const embed = {
                title: game.name,
                fields: [
                    {
                        name: "Status",
                        value: IGDBApi.statusToString(game?.currentReleaseStatus ?? 0)
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
                            IGDBApi.statusToString(game.nextReleaseStatus)
                            : "Geen status bekend"
                    }
                ],
                url: game.url,
                thumbnail: {
                    url: `https:${coverUrl}`
                }
            } as Embed;
            await interaction.reply({ embeds: [embed] });    
        } catch (error) {
            interaction.reply(`Er is iets fout gegaan. ${error}`);
        }
        
    }

}
