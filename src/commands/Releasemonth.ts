import { ChatInputCommandInteraction, Client, Embed, EmbedField, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import JSONDataHandler from "../classes/datahandlers/JSONDataHandler";
import IGDBApi from "../api/IGDBApi";
import { MONTHS, createEmbed, gameToValue as gameToValue, uniqueArray, uppercaseFirstLetter } from "../util/util";
import DiscordBot from "../classes/Bot";
import { Game } from "../api/IGDB";

export default class ReleaseMonth extends Command {

    

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("month").setDescription("Een maand").setRequired(true).setChoices(...MONTHS.map(month => ({ name: month, value: month })), { name: "Onbekend", value: "Onbekend" }))
            .addNumberOption(option => option.setName("year").setDescription("Een jaar").setRequired(false)) as SlashCommandBuilder;
            
    }

    constructor() {
        super("releasemonth", "Bekijk een maand met releases.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            const month = interaction.options.getString("month", true);
            const year = interaction.options.getNumber("year", false) ?? new Date().getFullYear();
            
            let games = await DiscordBot.getInstance().dataHandlers.gameSubscriptions.get(interaction.guildId ?? "") as Game[];

            games = month === "Onbekend" ? games.filter(game => game?.nextReleaseDate == undefined)
                    : games.filter(game => game?.nextReleaseDate != undefined && new Date((game.nextReleaseDate ?? 0) * 1000).getMonth() == MONTHS.indexOf(month) && new Date((game.nextReleaseDate ?? 0) * 1000).getFullYear() == year);
            if (!games?.length) return await interaction.reply({ content: "Deze maand heeft nog geen releases", ephemeral: true });

            const embed = await createEmbed(games, true) as Embed;
            await interaction.reply({ embeds: [embed], ephemeral: true });    
        } catch (error) {
            interaction.reply({content: `Er is iets fout gegaan. ${error}`, ephemeral: true});
        }
        
    }

}
