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
            const url = `${IGDBApi.baseUrl}/games`;
            const response = yield IGDBApi.post(url, `fields ${this.gameFields};
            where id = (${ids.join(',')});`);
            const games = response.data;
            const currentReleases = yield this.getCurrentReleases(games);
            games.forEach(game => {
                const currentRelease = currentReleases.find(release => release.game === game.id);
                if (currentRelease)
                    game.currentReleaseStatus = currentRelease === null || currentRelease === void 0 ? void 0 : currentRelease.status;
            });
            const nextReleaseDates = yield this.getNextReleaseDates(games);
            games.forEach(game => {
                const releaseDate = nextReleaseDates.find(release => release.game === game.id);
                if (releaseDate) {
                    game.nextReleaseDate = releaseDate.date;
                    game.nextReleaseStatus = releaseDate.status;
                }
            });
            return games;
        });
    }
    static searchGame(query) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${IGDBApi.baseUrl}/games`;
            let response = yield IGDBApi.post(url, `search "${query}";
            fields ${this.gameFields};
            where first_release_date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
            if (!response.data.length) {
                response = yield IGDBApi.post(url, `search "${query}";
                fields ${this.gameFields};
                limit 1;`);
            }
            if (!response.data.length)
                return undefined;
            const game = response.data[0];
            if (!((_a = game === null || game === void 0 ? void 0 : game.release_dates) === null || _a === void 0 ? void 0 : _a.length))
                return game;
            const currentRelease = yield this.getCurrentRelease(game.release_dates.map(id => id.toString()));
            if (currentRelease)
                game.currentReleaseStatus = currentRelease.status;
            const releaseDate = yield this.getNextReleaseDate(game.release_dates.map(id => id.toString()));
            if (releaseDate) {
                game.nextReleaseDate = releaseDate.date;
                game.nextReleaseStatus = releaseDate.status;
            }
            return game;
        });
    }
    static getNextReleaseDates(games) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!games.length)
                return Promise.resolve(undefined);
            const url = `${IGDBApi.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where id = (${games.map(game => game.release_dates).flat().join(',')}) & date > ${Math.floor(Date.now() / 1000)};`);
            return response.data;
        });
    }
    static getCurrentReleases(games) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!games.length)
                return Promise.resolve(undefined);
            const url = `${IGDBApi.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where id = (${games.map(game => game.release_dates).flat().join(',')}) & date < ${Math.floor(Date.now() / 1000)};`);
            return response.data;
        });
    }
    static getNextReleaseDate(releaseDateIDs) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!releaseDateIDs.length)
                return Promise.resolve(undefined);
            const url = `${IGDBApi.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where id = (${releaseDateIDs.join(',')}) & date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
            return (_a = response.data) === null || _a === void 0 ? void 0 : _a[0];
        });
    }
    static getCurrentRelease(releaseDateIDs) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!releaseDateIDs.length)
                return Promise.resolve(undefined);
            const url = `${IGDBApi.baseUrl}/release_dates`;
            let response = yield IGDBApi.post(url, `fields id,game,status,date;
            where id = (${releaseDateIDs.join(',')}) & date < ${Math.floor(Date.now() / 1000)};
            sort date desc;
            limit 1;`);
            return (_a = response.data) === null || _a === void 0 ? void 0 : _a[0];
        });
    }
    static statusToString(status) {
        return ["Onbekend", "Alpha", "Beta", "Early Access", "Offline", "Cancelled", "Full Release"][status];
    }
    static searchGameCover(cover) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!cover)
                return Promise.resolve(undefined);
            const url = `${IGDBApi.baseUrl}/covers`;
            let response = yield IGDBApi.post(url, `fields url;
            where id = ${cover};
            limit 1;`);
            return (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url;
        });
    }
}
IGDBApi.gameFields = [
    'id',
    'name',
    'url',
    'release_dates',
    'cover'
].join(',');
IGDBApi.baseUrl = 'https://api.igdb.com/v4';
exports.default = IGDBApi;
