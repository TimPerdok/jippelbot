import { ChatInputCommandInteraction, Client, Embed, EmbedField, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi, { Game } from "../api/IGDBApi";

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

    uniqueArray(array) {
        return array.filter((obj, index, self) =>
            index === self.findIndex((o) => o.key === obj.key)
        );
    }


    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            let games = await DataHandler.getGameSubscriptions(interaction.guildId ?? "");
            if (!games?.length) return await interaction.reply({ content: "Er zijn nog geen games toegevoegd.", ephemeral: true });

            const months = [...new Set<MonthMapping>(
                games
                    .filter(game => game?.nextReleaseDate != undefined)
                    .map(game => new Date((game.nextReleaseDate) * 1000))
                    .map(date => {
                        return {
                            key: `${date.getMonth()}-${date.getFullYear()}`,
                            value: date
                        }
                    })
            )]
            .map(month => month.value)
            .sort((a, b) => a.getTime() - b.getTime())
            
            
            let fields = [...months].map(month => {
                const gamesOfMonth = games.filter(game => {
                    const date = new Date((game.nextReleaseDate ?? 0) * 1000);
                    return date.getMonth() == month.getMonth() && date.getFullYear() == month.getFullYear();
                });

                return {
                    name: this.uppercaseFirstLetter(month.toLocaleString("nl-NL", { month: "long", year: "numeric" })),
                    value: gamesOfMonth.map((game) => this.toValue(game)).join("\n"),
                }
            })

            const unknownDateField = {
                name: "Onbekend",
                value: games
                    .filter(game => game?.nextReleaseDate == undefined)
                    .map(game => this.toValue(game)).join("\n"),
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

    toValue(game: Game) {
        
        const date = new Date((game?.nextReleaseDate ?? 0) * 1000);
        const status = game?.currentReleaseStatus != undefined
            ? `(${IGDBApi.statusToString(game.currentReleaseStatus ?? 0)})`
            : "";
        return `- ${game.name} ${status}
            ${game?.nextReleaseDate ?
                `<t:${Math.round(date.getTime() / 1000)}:R>`
                : ""}
                ${game?.userDescription ?
                    `  - ${game.userDescription}` : ""}`
    }

    uppercaseFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

}
