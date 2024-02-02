import { ChatInputCommandInteraction, Client, Embed, EmbedField, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi, { Game } from "../api/IGDBApi";
import { MONTHS, gameToValue as gameToValue, uniqueArray, uppercaseFirstLetter } from "../util/util";

export default class ReleaseMonth extends Command {

    

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("month").setDescription("Een maand").setRequired(true).setChoices(...MONTHS.map(month => ({ name: month, value: month }))))
            .addNumberOption(option => option.setName("year").setDescription("Een jaar").setRequired(false)) as SlashCommandBuilder;
            
    }

    constructor() {
        super("releasemonth", "Bekijk een maand met releases.")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            const month = interaction.options.getString("month", true);
            const year = interaction.options.getNumber("year", false) ?? new Date().getFullYear();
            let games: Game[] = (await DataHandler.getGameSubscriptions(interaction.guildId ?? ""))
                .filter(game => game?.nextReleaseDate != undefined && new Date((game.nextReleaseDate ?? 0) * 1000).getMonth() == MONTHS.indexOf(month) && new Date((game.nextReleaseDate ?? 0) * 1000).getFullYear() == year);

            if (!games?.length) return await interaction.reply({ content: "Deze maand heeft nog geen releases", ephemeral: true });

            const months = [...new Set<{key:string,value:Date}>(
                uniqueArray(games
                    .filter(game => game?.nextReleaseDate != undefined)
                    .map(game => new Date((game.nextReleaseDate) * 1000))
                    .map(date => ({
                        key: `${date.getMonth()}-${date.getFullYear()}`,
                        value: date
                    }))
                )
            )]
            .map(month => month.value)
            .sort((a, b) => a.getTime() - b.getTime())
            
            let fields: EmbedField[] = [...months].map(month => {
                const gamesOfMonth = games.filter(game => {
                    const date = new Date((game.nextReleaseDate ?? 0) * 1000);
                    return date.getMonth() == month.getMonth() && date.getFullYear() == month.getFullYear();
                });
                let exceededCount = 0;
                const truncated: string[] = []
                gamesOfMonth.forEach((game) => {
                    if (truncated.join("\n").length > 1000) return exceededCount++;
                    truncated.push(gameToValue(game));
                })
                if (exceededCount > 0) truncated.push(`& ${exceededCount} meer`)
                return {
                    name: uppercaseFirstLetter(month.toLocaleString("nl-NL", { month: "long", year: "numeric" })),
                    value: truncated.join("\n"),
                    inline: false
                }
            })
            
            const embed = {
                title: `Releases`,
                fields
            } as Embed;
            await interaction.reply({ embeds: [embed], ephemeral: true });    
        } catch (error) {
            interaction.reply(`Er is iets fout gegaan. ${error}`);
        }
        
    }

}
