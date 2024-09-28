"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Bot_1 = __importDefault(require("../classes/Bot"));
const IGDB_1 = __importDefault(require("./IGDB"));
class IGDBApi {
    static async post(url, data) {
        return await axios_1.default.post(url, data, {
            headers: {
                'Client-ID': Bot_1.default.getInstance().twitchAccessTokenHandler.clientId,
                'Authorization': `Bearer ${await Bot_1.default.getInstance().twitchAccessTokenHandler.getAccessToken()}`,
            }
        });
    }
    static async searchGames(ids) {
        if (!ids?.length)
            return Promise.resolve([]);
        const url = `${IGDB_1.default.baseUrl}/games`;
        const response = await IGDBApi.post(url, `fields ${IGDB_1.default.gameFields};
            where id = (${ids.join(',')});
            limit 500;`);
        let games = response.data;
        games = await this.addCurrentReleases(games);
        games = await this.addNextReleases(games);
        return games;
    }
    static async addCurrentReleases(games) {
        const currentReleases = await this.getCurrentReleases(games);
        games.forEach(game => {
            const currentRelease = currentReleases?.find(release => release.game === game.id);
            if (currentRelease)
                game.currentReleaseStatus = currentRelease?.status;
        });
        return games;
    }
    static async addNextReleases(games) {
        const nextReleaseDates = await this.getNextReleaseDates(games);
        games.forEach(game => {
            const releaseDate = nextReleaseDates?.find(release => release.game === game.id);
            if (releaseDate) {
                game.nextReleaseDate = releaseDate.date;
                game.nextReleaseStatus = releaseDate.status;
            }
        });
        return games;
    }
    static async presearchGame(query) {
        const url = `${IGDB_1.default.baseUrl}/games`;
        let response = await IGDBApi.post(url, `search "${query}";
            fields ${IGDB_1.default.gameFields};
            limit 5;`);
        if (!response.data?.length)
            return [];
        let games = response.data;
        games = await this.addNextReleases(games);
        return games;
    }
    static async enrichGameData(game) {
        const currentRelease = await this.getCurrentRelease(game?.release_dates?.map(id => id.toString()) ?? []);
        if (currentRelease)
            game.currentReleaseStatus = currentRelease.status;
        const releaseDate = await this.getNextReleaseDate(game?.release_dates?.map(id => id.toString()) ?? []);
        if (releaseDate) {
            game.nextReleaseDate = releaseDate.date;
            game.nextReleaseStatus = releaseDate.status;
        }
        const steamUrl = await this.getSteamUrl(game?.websites);
        if (steamUrl)
            game.url = steamUrl;
        return game;
    }
    static async getGameById(id) {
        const url = `${IGDB_1.default.baseUrl}/games`;
        let response = await IGDBApi.post(url, `fields ${IGDB_1.default.gameFields};
            where id = ${id};
            limit 1;`);
        if (!response.data.length)
            return undefined;
        let game = response.data[0];
        if (!game?.release_dates?.length)
            return game;
        game = await this.enrichGameData(game);
        return game;
    }
    static async searchGame(query) {
        const url = `${IGDB_1.default.baseUrl}/games`;
        let response = await IGDBApi.post(url, `search "${query}";
            fields ${IGDB_1.default.gameFields};
            where first_release_date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
        if (!response.data.length) {
            response = await IGDBApi.post(url, `search "${query}";
                fields ${IGDB_1.default.gameFields};
                limit 1;`);
        }
        if (!response.data.length)
            return undefined;
        let game = response.data[0];
        if (!game?.release_dates?.length)
            return game;
        game = await this.enrichGameData(game);
        return game;
    }
    static async getSteamUrl(id) {
        if (!id?.length)
            return Promise.resolve(undefined);
        const url = `${IGDB_1.default.baseUrl}/websites`;
        let response = await IGDBApi.post(url, `fields url;
            where id = (${id.join(",")}) & category = 13;
            limit 1;`);
        return response.data?.[0]?.url;
    }
    static async getNextReleaseDates(games) {
        const releaseDates = games.filter(game => game?.release_dates).map(game => game.release_dates).flat();
        if (!releaseDates?.length)
            return Promise.resolve(undefined);
        const url = `${IGDB_1.default.baseUrl}/release_dates`;
        let response = await IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDates.join(',')}) & date > ${Math.floor(Date.now() / 1000)};`);
        return response.data;
    }
    static async getCurrentReleases(games) {
        const releaseDates = games.filter(game => game?.release_dates).map(game => game.release_dates).flat();
        if (!releaseDates?.length)
            return Promise.resolve(undefined);
        const url = `${IGDB_1.default.baseUrl}/release_dates`;
        let response = await IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDates.join(',')}) & date < ${Math.floor(Date.now() / 1000)};`);
        return response.data;
    }
    static async getNextReleaseDate(releaseDateIDs) {
        if (!releaseDateIDs?.length)
            return Promise.resolve(undefined);
        const url = `${IGDB_1.default.baseUrl}/release_dates`;
        let response = await IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDateIDs.join(',')}) & date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
        return response.data?.[0];
    }
    static async getCurrentRelease(releaseDateIDs) {
        if (!releaseDateIDs?.length)
            return Promise.resolve(undefined);
        const url = `${IGDB_1.default.baseUrl}/release_dates`;
        let response = await IGDBApi.post(url, `fields id,game,status,date;
            where platform = 6 & id = (${releaseDateIDs.join(',')}) & date < ${Math.floor(Date.now() / 1000)};
            sort date desc;
            limit 1;`);
        return response.data?.[0];
    }
    static async searchGameCover(cover) {
        if (!cover)
            return Promise.resolve(undefined);
        const url = `${IGDB_1.default.baseUrl}/covers`;
        let response = await IGDBApi.post(url, `fields url;
            where id = ${cover};
            limit 1;`);
        return response.data?.[0]?.url;
    }
}
exports.default = IGDBApi;
