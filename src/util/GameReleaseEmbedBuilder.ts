import { Embed, EmbedField } from "discord.js";
import IGDB, { Game } from "../api/IGDB";
import { uppercaseFirstLetter } from "./util";

export default class GameReleaseEmbedBuilder {

    private static isBroadRelease = (date: Date) => date.getUTCMonth() === 11 && date.getUTCDate() === 31;

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

        datesWithReleaseInMonth?.reduce((previous: Date, current: Date, index: number) => {
            const month = current.getUTCMonth();
            const year = current.getUTCFullYear();
            const isLast = index === datesWithReleaseInMonth.length - 1;

            const toNextYear = previous && previous.getUTCFullYear() !== year;

            if (toNextYear || isLast) {
                const gamesWithBroadReleaseInYear = games.filter(game => {
                    const date = new Date((game.nextReleaseDate ?? 0) * 1000);
                    return date.getUTCFullYear() === previous.getUTCFullYear() && this.isBroadRelease(date);
                });
                if (gamesWithBroadReleaseInYear.length) {
                    embedFields.push(
                        this.createEmbedField(
                            previous.getUTCFullYear().toString(),
                            gamesWithBroadReleaseInYear,
                            small
                        )
                    )
                }
            }


            const gamesOfMonth = games.filter(game => {
                const date = new Date((game.nextReleaseDate ?? 0) * 1000);
                return date.getUTCMonth() === month && date.getUTCFullYear() === year && !this.isBroadRelease(date);
            }).sort((a, b) => (a?.nextReleaseDate ?? 0) - (b?.nextReleaseDate ?? 0));

            if (!gamesOfMonth.length) return current;

            embedFields.push(this.createEmbedField(
                current.toLocaleString("nl-NL", { month: "long", year: "numeric" }),
                gamesOfMonth,
                small));

            return current;
        })



        embedFields.push(this.createEmbedField("Onbekend", this.getUnknownReleaseDateGames(games), small))
        return embedFields;
    }


    private static createEmbedField(heading: string, games: Game[], small: boolean): EmbedField {
        let exceededCount = 0;
        const lines: string[] = []
        games.forEach((game) => {
            if (lines.join("\n").length > 950) return exceededCount++;
            lines.push(this.formatRelease(game, small));
        })
        if (exceededCount > 0) lines.push(`& ${exceededCount} meer`)
        return {
            name: uppercaseFirstLetter(heading),
            value: lines.join("\n"),
            inline: false
        }
    }

    private static getUnknownReleaseDateGames(games: Game[]): Game[] {
        return games.filter(game => !game?.nextReleaseDate)
    }

    private static getMonthsWithReleases(games: Game[]): Date[] {
        return Object.entries(
            Object.fromEntries(
                games
                    .filter(game => game?.nextReleaseDate != undefined)
                    .map(game => new Date((game.nextReleaseDate ?? 0) * 1000))
                    .map(date => ([`${date.getUTCMonth()}-${date.getUTCFullYear()}`, date]))))
            .map(([key, value]) => value)
            .sort((a, b) => a.getTime() - b.getTime())
    }

}