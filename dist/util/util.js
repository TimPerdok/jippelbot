"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmbed = exports.MONTHS = exports.gameToValue = exports.uppercaseFirstLetter = exports.uniqueArray = void 0;
const IGDBApi_1 = __importDefault(require("../api/IGDBApi"));
function uniqueArray(array) {
    return array.filter((obj, index, self) => index === self.findIndex((o) => o.key === obj.key));
}
exports.uniqueArray = uniqueArray;
function uppercaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.uppercaseFirstLetter = uppercaseFirstLetter;
function gameToValue(game, small = false) {
    var _a, _b;
    const date = new Date(((_a = game === null || game === void 0 ? void 0 : game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
    const status = (game === null || game === void 0 ? void 0 : game.nextReleaseStatus) != undefined
        ? `(${IGDBApi_1.default.statusToString((_b = game.nextReleaseStatus) !== null && _b !== void 0 ? _b : 0)}) `
        : "";
    return `- ${small ? game.name : `[${game.name}](${game.url})`} ${status}
        ${(game === null || game === void 0 ? void 0 : game.nextReleaseDate) ?
        `<t:${Math.round(date.getTime() / 1000)}:R>`
        : ""}
            ${(game === null || game === void 0 ? void 0 : game.userDescription) ?
        `  - ${game.userDescription}` : ""}`;
}
exports.gameToValue = gameToValue;
exports.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
function createEmbed(games, small = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const months = [...new Set(uniqueArray(games
                .filter(game => (game === null || game === void 0 ? void 0 : game.nextReleaseDate) != undefined)
                .map(game => new Date((game.nextReleaseDate) * 1000))
                .map(date => ({
                key: `${date.getMonth()}-${date.getFullYear()}`,
                value: date
            }))))]
            .map(month => month.value)
            .sort((a, b) => a.getTime() - b.getTime());
        let fields = [...months].map(month => {
            const gamesOfMonth = games.filter(game => {
                var _a;
                const date = new Date(((_a = game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
                return date.getMonth() == month.getMonth() && date.getFullYear() == month.getFullYear();
            }).sort((a, b) => { var _a, _b; return ((_a = a === null || a === void 0 ? void 0 : a.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) - ((_b = b === null || b === void 0 ? void 0 : b.nextReleaseDate) !== null && _b !== void 0 ? _b : 0); });
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
        games.filter(game => (game === null || game === void 0 ? void 0 : game.nextReleaseDate) == undefined)
            .forEach((game) => {
            if (truncated.join("\n").length > 950)
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
    });
}
exports.createEmbed = createEmbed;
