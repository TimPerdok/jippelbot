"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameToValue = exports.uppercaseFirstLetter = exports.uniqueArray = void 0;
const IGDBApi_1 = __importDefault(require("../api/IGDBApi"));
function uniqueArray(array) {
    return array.filter((obj, index, self) => index === self.findIndex((o) => o.key === obj.key));
}
exports.uniqueArray = uniqueArray;
function uppercaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.uppercaseFirstLetter = uppercaseFirstLetter;
function gameToValue(game) {
    var _a, _b;
    const date = new Date(((_a = game === null || game === void 0 ? void 0 : game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
    const status = (game === null || game === void 0 ? void 0 : game.currentReleaseStatus) != undefined
        ? `(${IGDBApi_1.default.statusToString((_b = game.currentReleaseStatus) !== null && _b !== void 0 ? _b : 0)})`
        : "";
    return `- [${game.name}](${game.url}) ${status}
        ${(game === null || game === void 0 ? void 0 : game.nextReleaseDate) ?
        `<t:${Math.round(date.getTime() / 1000)}:R>`
        : ""}
            ${(game === null || game === void 0 ? void 0 : game.userDescription) ?
        `  - ${game.userDescription}` : ""}`;
}
exports.gameToValue = gameToValue;
