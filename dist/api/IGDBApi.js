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
const axios_1 = __importDefault(require("axios"));
const Bot_1 = __importDefault(require("../classes/Bot"));
const IGDB_1 = __importDefault(require("./IGDB"));
class IGDBApi {
    static post(url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.post(url, data, {
                headers: {
                    'Client-ID': Bot_1.default.getInstance().twitchAccessTokenHandler.clientId,
                    'Authorization': `Bearer ${yield Bot_1.default.getInstance().twitchAccessTokenHandler.getAccessToken()}`,
                }
            });
        });
    }
    static searchGames(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(ids === null || ids === void 0 ? void 0 : ids.length))
                return Promise.resolve([]);
            const url = `${IGDB_1.default.baseUrl}/games`;
            const response = yield IGDBApi.post(url, `fields ${IGDB_1.default.gameFields};
            where id = (${ids.join(',')});`);
            let games = response.data;
            games = yield this.addCurrentReleases(games);
            games = yield this.addNextReleases(games);
            return games;
        });
    }
    static addCurrentReleases(games) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentReleases = yield this.getCurrentReleases(games);
            games.forEach(game => {
                const currentRelease = currentReleases === null || currentReleases === void 0 ? void 0 : currentReleases.find(release => release.game === game.id);
                if (currentRelease)
                    game.currentReleaseStatus = currentRelease === null || currentRelease === void 0 ? void 0 : currentRelease.status;
            });
            return games;
        });
    }
    static addNextReleases(games) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextReleaseDates = yield this.getNextReleaseDates(games);
            games.forEach(game => {
                const releaseDate = nextReleaseDates === null || nextReleaseDates === void 0 ? void 0 : nextReleaseDates.find(release => release.game === game.id);
                if (releaseDate) {
                    game.nextReleaseDate = releaseDate.date;
                    game.nextReleaseStatus = releaseDate.status;
                }
            });
            return games;
        });
    }
    static presearchGame(query) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${IGDB_1.default.baseUrl}/games`;
            let response = yield IGDBApi.post(url, `search "${query}";
            fields ${IGDB_1.default.gameFields};
            limit 5;`);
            if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.length))
                return [];
            let games = response.data;
            games = yield this.addNextReleases(games);
            return games;
        });
    }
    static enrichGameData(game) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const currentRelease = yield this.getCurrentRelease((_b = (_a = game === null || game === void 0 ? void 0 : game.release_dates) === null || _a === void 0 ? void 0 : _a.map(id => id.toString())) !== null && _b !== void 0 ? _b : []);
            if (currentRelease)
                game.currentReleaseStatus = currentRelease.status;
            const releaseDate = yield this.getNextReleaseDate((_d = (_c = game === null || game === void 0 ? void 0 : game.release_dates) === null || _c === void 0 ? void 0 : _c.map(id => id.toString())) !== null && _d !== void 0 ? _d : []);
            if (releaseDate) {
                game.nextReleaseDate = releaseDate.date;
                game.nextReleaseStatus = releaseDate.status;
            }
            const steamUrl = yield this.getSteamUrl(game === null || game === void 0 ? void 0 : game.websites);
            if (steamUrl)
                game.url = steamUrl;
            return game;
        });
    }
    static getGameById(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${IGDB_1.default.baseUrl}/games`;
            let response = yield IGDBApi.post(url, `fields ${IGDB_1.default.gameFields};
            where id = ${id};
            limit 1;`);
            if (!response.data.length)
                return undefined;
            let game = response.data[0];
            if (!((_a = game === null || game === void 0 ? void 0 : game.release_dates) === null || _a === void 0 ? void 0 : _a.length))
                return game;
            game = yield this.enrichGameData(game);
            return game;
        });
    }
    static searchGame(query) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${IGDB_1.default.baseUrl}/games`;
            let response = yield IGDBApi.post(url, `search "${query}";
            fields ${IGDB_1.default.gameFields};
            where first_release_date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
            if (!response.data.length) {
                response = yield IGDBApi.post(url, `search "${query}";
                fields ${IGDB_1.default.gameFields};
                limit 1;`);
            }
            if (!response.data.length)
                return undefined;
            let game = response.data[0];
            if (!((_a = game === null || game === void 0 ? void 0 : game.release_dates) === null || _a === void 0 ? void 0 : _a.length))
                return game;
            game = yield this.enrichGameData(game);
            return game;
        });
    }
    static getSteamUrl(id) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(id === null || id === void 0 ? void 0 : id.length))
                return Promise.resolve(undefined);
            const url = `${IGDB_1.default.baseUrl}/websites`;
            let response = yield IGDBApi.post(url, `fields url;
            where id = (${id.join(",")}) & category = 13;
            limit 1;`);
            return (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url;
        });
    }
    static getNextReleaseDates(games) {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseDates = games.filter(game => game === null || game === void 0 ? void 0 : game.release_dates).map(game => game.release_dates).flat();
            if (!(releaseDates === null || releaseDates === void 0 ? void 0 : releaseDates.length))
                return Promise.resolve(undefined);
            const url = `${IGDB_1.default.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDates.join(',')}) & date > ${Math.floor(Date.now() / 1000)};`);
            return response.data;
        });
    }
    static getCurrentReleases(games) {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseDates = games.filter(game => game === null || game === void 0 ? void 0 : game.release_dates).map(game => game.release_dates).flat();
            if (!(releaseDates === null || releaseDates === void 0 ? void 0 : releaseDates.length))
                return Promise.resolve(undefined);
            const url = `${IGDB_1.default.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDates.join(',')}) & date < ${Math.floor(Date.now() / 1000)};`);
            return response.data;
        });
    }
    static getNextReleaseDate(releaseDateIDs) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(releaseDateIDs === null || releaseDateIDs === void 0 ? void 0 : releaseDateIDs.length))
                return Promise.resolve(undefined);
            const url = `${IGDB_1.default.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDateIDs.join(',')}) & date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
            return (_a = response.data) === null || _a === void 0 ? void 0 : _a[0];
        });
    }
    static getCurrentRelease(releaseDateIDs) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(releaseDateIDs === null || releaseDateIDs === void 0 ? void 0 : releaseDateIDs.length))
                return Promise.resolve(undefined);
            const url = `${IGDB_1.default.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDateIDs.join(',')}) & date < ${Math.floor(Date.now() / 1000)};
            sort date desc;
            limit 1;`);
            return (_a = response.data) === null || _a === void 0 ? void 0 : _a[0];
        });
    }
    static searchGameCover(cover) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!cover)
                return Promise.resolve(undefined);
            const url = `${IGDB_1.default.baseUrl}/covers`;
            let response = yield IGDBApi.post(url, `fields url;
            where id = ${cover};
            limit 1;`);
            return (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url;
        });
    }
}
exports.default = IGDBApi;
