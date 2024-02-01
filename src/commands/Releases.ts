import { ChatInputCommandInteraction, Client, Embed, EmbedField, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi, { Game } from "../api/IGDBApi";
import { gameToValue, uniqueArray, uppercaseFirstLetter } from "../util/util";

type MonthMapping = {
    key: string,
    value: Date
}
export default class ReleaseList extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }

    constructor() {
        super("releases", "Laat alle upcoming game releases zien")
    }



    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            let games = await DataHandler.getGameSubscriptions(interaction.guildId ?? "");
            if (!games?.length) return await interaction.reply({ content: "Er zijn nog geen games toegevoegd.", ephemeral: true });

            const months = [...new Set<MonthMapping>(
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
                    if (truncated.join("\n").length > 950) return exceededCount++;
                    truncated.push(gameToValue(game));
                })
                if (exceededCount > 0) truncated.push(`& ${exceededCount} meer`)
                return {
                    name: uppercaseFirstLetter(month.toLocaleString("nl-NL", { month: "long", year: "numeric" })),
                    value: truncated.join("\n"),
                    inline: false
                }
            })

            let exceededCount = 0;
            const truncated: string[] = []
            games.filter(game => game?.nextReleaseDate == undefined)
                .forEach((game) => {
                    if (truncated.join("\n").length > 950) return exceededCount++;
                    truncated.push(gameToValue(game));
                })
            if (exceededCount > 0) truncated.push(`& ${exceededCount} meer`)
            const unknownDateField: EmbedField = {
                name: "Onbekend",
                value: truncated.join("\n"),
                inline: false
            };
                
            fields.push(unknownDateField);
            const embed = {
                title: "Upcoming game releases",
                fields
            };
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply(`Er is iets fout gegaan. ${error}`);
        }

    }

}

