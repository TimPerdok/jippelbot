"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IGDB_1 = __importDefault(require("../api/IGDB"));
const util_1 = require("./util");
class GameReleaseEmbedBuilder {
    static formatRelease(game, small = false) {
        const date = new Date((game?.nextReleaseDate ?? 0) * 1000);
        const status = game?.nextReleaseStatus != undefined
            ? `(${IGDB_1.default.statusToString(game.nextReleaseStatus ?? 0)}) `
            : "";
        return `- ${small ? game.name : `[${game.name}](${game.url})`} ${status}
        ${game?.nextReleaseDate ?
            `<t:${Math.round(date.getTime() / 1000)}:R>`
            : ""}
            ${game?.userDescription ?
            `  - ${game.userDescription}` : ""}`;
    }
    static createEmbed(games, small = false) {
        let fields = this.createEmbedFields(games, small);
        return {
            title: "Upcoming game releases",
            fields,
            timestamp: new Date().toISOString()
        };
    }
    static createEmbedFields(games, small) {
        const datesWithReleaseInMonth = this.getMonthsWithReleases(games);
        const embedFields = [];
        if (!datesWithReleaseInMonth.length)
            return [];
        const gamesWithRelease = games.filter(game => !!game.nextReleaseDate);
        datesWithReleaseInMonth?.reduce((previous, current, index) => {
            const month = current.getMonth();
            const year = current.getFullYear();
            const gamesOfMonth = gamesWithRelease
                .filter(game => {
                const date = new Date((game.nextReleaseDate ?? 0) * 1000);
                return date.getMonth() === month && date.getFullYear() === year;
            }).sort((a, b) => (a?.nextReleaseDate ?? 0) - (b?.nextReleaseDate ?? 0));
            if (!gamesOfMonth.length)
                return current;
            const normalGamesOfMonth = gamesOfMonth.filter(game => !this.isBroadRelease(new Date((game.nextReleaseDate ?? 0) * 1000)));
            const toNextYear = previous && previous.getFullYear() !== year;
            const isLast = index === datesWithReleaseInMonth.length - 1;
            if (((toNextYear || isLast))) {
                const gamesWithBroadReleaseInYear = games
                    .filter(game => new Date((game.nextReleaseDate ?? 0) * 1000).getFullYear() === previous.getFullYear())
                    .filter(game => this.isBroadRelease(new Date((game.nextReleaseDate ?? 0) * 1000)));
                if (gamesWithBroadReleaseInYear.length)
                    embedFields.push(this.createEmbedField(previous.getFullYear().toString(), gamesWithBroadReleaseInYear, small));
            }
            if (!normalGamesOfMonth.length)
                return current;
            embedFields.push(this.createEmbedField(current.toLocaleString("nl-NL", { month: "long", year: "numeric" }), normalGamesOfMonth, small));
            return current;
        });
        embedFields.push(this.createEmbedField("Onbekend", games.filter(game => !game.nextReleaseDate), small));
        return embedFields;
    }
    static createEmbedField(heading, games, small) {
        let exceededCount = 0;
        const lines = [];
        games.forEach((game) => {
            if (lines.join("\n").length > 950)
                return exceededCount++;
            lines.push(this.formatRelease(game, small));
        });
        if (exceededCount > 0)
            lines.push(`& ${exceededCount} meer`);
        return {
            name: (0, util_1.uppercaseFirstLetter)(heading),
            value: lines.join("\n"),
            inline: false
        };
    }
    static getMonthsWithReleases(games) {
        return Object.entries(Object.fromEntries(games
            .filter(game => game?.nextReleaseDate != undefined)
            .map(game => new Date((game.nextReleaseDate ?? 0) * 1000))
            .map(date => {
            console.log(([`${date.getMonth()}-${date.getFullYear()}`, date]));
            return ([`${date.getMonth()}-${date.getFullYear()}`, date]);
        })))
            .map(([key, value]) => value)
            .sort((a, b) => a.getTime() - b.getTime());
    }
}
GameReleaseEmbedBuilder.isBroadRelease = (date) => date.getMonth() === 11 && date.getDate() === 31;
exports.default = GameReleaseEmbedBuilder;
