"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONTHS = void 0;
exports.uniqueArray = uniqueArray;
exports.uppercaseFirstLetter = uppercaseFirstLetter;
exports.gameToValue = gameToValue;
exports.createEmbed = createEmbed;
const IGDB_1 = __importDefault(require("../api/IGDB"));
function uniqueArray(array) {
    return array.filter((obj, index, self) => index === self.findIndex((o) => o.key === obj.key));
}
function uppercaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function gameToValue(game, small = false) {
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
exports.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
async function createEmbed(games, small = false) {
    const months = [...new Set(uniqueArray(games
            .filter(game => game?.nextReleaseDate != undefined)
            .map(game => new Date((game.nextReleaseDate ?? 0) * 1000))
            .map(date => ({
            key: `${date.getMonth()}-${date.getFullYear()}`,
            value: date
        }))))]
        .map(month => month.value)
        .sort((a, b) => a.getTime() - b.getTime());
    let fields = [...months].map(month => {
        const gamesOfMonth = games.filter(game => {
            const date = new Date((game.nextReleaseDate ?? 0) * 1000);
            return date.getMonth() == month.getMonth() && date.getFullYear() == month.getFullYear();
        }).sort((a, b) => (a?.nextReleaseDate ?? 0) - (b?.nextReleaseDate ?? 0));
        let exceededCount = 0;
        const truncated = [];
        gamesOfMonth.forEach((game) => {
            if (truncated.join("\n").length > 950)
                return exceededCount++;
            truncated.push(gameToValue(game, small));
        });
        if (exceededCount > 0)
            truncated.push(`& ${exceededCount} meer`);
        return {
            name: uppercaseFirstLetter(month.toLocaleString("nl-NL", { month: "long", year: "numeric" })),
            value: truncated.join("\n"),
            inline: false
        };
    });
    let exceededCount = 0;
    const truncated = [];
    games.filter(game => game?.nextReleaseDate == undefined)
        .forEach((game) => {
        if (truncated.join("\n").length > 900)
            return exceededCount++;
        truncated.push(gameToValue(game, small));
    });
    if (exceededCount > 0)
        truncated.push(`& ${exceededCount} meer`);
    const unknownDateField = {
        name: "Onbekend",
        value: truncated.join("\n"),
        inline: false
    };
    fields.push(unknownDateField);
    const embed = {
        title: "Upcoming game releases",
        fields,
        timestamp: new Date().toISOString()
    };
    return embed;
}
