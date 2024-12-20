import { Embed, EmbedField } from "discord.js";
import IGDB, { Game } from "../api/IGDB";
import { uppercaseFirstLetter } from "./util";

export default class GameReleaseEmbedBuilder {

    private static isBroadRelease = (date: Date) => date.getMonth() === 11 && date.getDate() === 31;

    private static formatRelease(game: Game, small = false) {
        const date = new Date((game?.nextReleaseDate ?? 0) * 1000);
        const status = game?.nextReleaseStatus != undefined
            ? `(${IGDB.statusToString(game.nextReleaseStatus ?? 0)}) `
            : "";
        return `- ${small ? game.name : `[${game.name}](${game.url})`} ${status}
        ${game?.nextReleaseDate ?
                `<t:${Math.round(date.getTime() / 1000)}:R>`
                : ""}
            ${game?.userDescription ?
                `  - ${game.userDescription}` : ""}`
    }

    public static createEmbed(games: Game[], small = false): Partial<Embed> {
        let fields: EmbedField[] = this.createEmbedFields(games, small)
        return {
            title: "Upcoming game releases",
            fields,
            timestamp: new Date().toISOString()
        };
    }

    private static createEmbedFields(games: Game[], small: boolean): EmbedField[] {
        const datesWithReleaseInMonth = this.getMonthsWithReleases(games)
        const embedFields: EmbedField[] = []
        if (!datesWithReleaseInMonth.length) return [];

        const gamesWithRelease = games.filter(game => !!game.nextReleaseDate)

        datesWithReleaseInMonth?.reduce((previous: Date, current: Date, index: number) => {
            const month = current.getMonth();
            const year = current.getFullYear();

            const gamesOfMonth = gamesWithRelease
                .filter(game => {
                    const date = new Date((game.nextReleaseDate ?? 0) * 1000);
                    return date.getMonth() === month && date.getFullYear() === year;
                }).sort((a, b) => (a?.nextReleaseDate ?? 0) - (b?.nextReleaseDate ?? 0));


            if (!gamesOfMonth.length) return current;


            const normalGamesOfMonth = gamesOfMonth.filter(game => !this.isBroadRelease(new Date((game.nextReleaseDate ?? 0) * 1000)));

            const toNextYear = previous && previous.getFullYear() !== year;
            const isLast = index === datesWithReleaseInMonth.length - 1;
            if (((toNextYear || isLast))) {
                const gamesWithBroadReleaseInYear = games
                    .filter(game => new Date((game.nextReleaseDate ?? 0) * 1000).getFullYear() === previous.getFullYear())
                    .filter(game => this.isBroadRelease(new Date((game.nextReleaseDate ?? 0) * 1000)));
                    
                if (gamesWithBroadReleaseInYear.length) embedFields.push(
                    this.createEmbedField(
                        previous.getFullYear().toString(),
                        gamesWithBroadReleaseInYear,
                        small
                    )
                )
            }

            if (!normalGamesOfMonth.length) return current;
            embedFields.push(this.createEmbedField(
                current.toLocaleString("nl-NL", { month: "long", year: "numeric" }),
                normalGamesOfMonth,
                small));

            return current;
        }, null);

        embedFields.push(this.createEmbedField("Onbekend", games.filter(game => !game.nextReleaseDate), small))
        return embedFields;
    }


    private static createEmbedField(heading: string, games: Game[], small: boolean): EmbedField {
        let exceededCount = 0;
        const lines: string[] = []
        games.forEach((game) => {
            const formattedRelease = this.formatRelease(game, small);
            if (lines.join("\n").length + formattedRelease.length > 980) return exceededCount++;
            lines.push(formattedRelease);
        })
        if (exceededCount > 0) lines.push(`& ${exceededCount} meer`)
        return {
            name: uppercaseFirstLetter(heading),
            value: lines.join("\n"),
            inline: false
        }
    }

    private static getMonthsWithReleases(games: Game[]): Date[] {
        return Object.entries(
            Object.fromEntries(
                games
                    .filter(game => game?.nextReleaseDate != undefined)
                    .map(game => new Date((game.nextReleaseDate ?? 0) * 1000))
                    .map(date => {
                        return ([`${date.getMonth()}-${date.getFullYear()}`, date])
                    })))
            .map(([key, value]) => value)
            .sort((a, b) => a.getTime() - b.getTime())
    }

}