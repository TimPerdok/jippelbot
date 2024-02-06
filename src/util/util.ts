import { TextChannel, EmbedField, Embed } from "discord.js";
import IGDBApi, { Game } from "../api/IGDBApi";
import DiscordBot from "../classes/Bot";
import DataHandler from "../classes/datahandlers/DataHandler";

export function uniqueArray(array) {
    return array.filter((obj, index, self) =>
        index === self.findIndex((o) => o.key === obj.key)
    );
}


export function uppercaseFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function gameToValue(game: Game, small = false) {
    const date = new Date((game?.nextReleaseDate ?? 0) * 1000);
    const status = game?.currentReleaseStatus != undefined
        ? `(${IGDBApi.statusToString(game.currentReleaseStatus ?? 0)})`
        : "";
    return `- ${small ? game.name : `[${game.name}](${game.url})`} ${status}
        ${game?.nextReleaseDate ?
            `<t:${Math.round(date.getTime() / 1000)}:R>`
            : ""}
            ${game?.userDescription ?
                `  - ${game.userDescription}` : ""}`
}

export const MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December" ];

export async function createEmbed(games: Game[], small = false): Promise<Partial<Embed>> {
    const months = [...new Set<{
        key: string,
        value: Date
    }>(
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
        }).sort((a, b) => (a?.nextReleaseDate ?? 0) - (b?.nextReleaseDate ?? 0));
        let exceededCount = 0;
        const truncated: string[] = []
        gamesOfMonth.forEach((game) => {
            if (truncated.join("\n").length > 950) return exceededCount++;
            truncated.push(gameToValue(game, small));
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
            truncated.push(gameToValue(game, small));
        })
    if (exceededCount > 0) truncated.push(`& ${exceededCount} meer`)
    const unknownDateField: EmbedField = {
        name: "Onbekend",
        value: truncated.join("\n"),
        inline: false
    };

    fields.push(unknownDateField);
    const embed: Partial<Embed> = {
        title: "Upcoming game releases",
        fields,
        timestamp: new Date().toISOString()
    };
    return embed
}