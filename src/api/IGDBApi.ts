import axios from 'axios';
import Bot from '../classes/Bot';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, InteractionEditReplyOptions, Message, MessagePayload } from 'discord.js';
import CustomIdentifier from '../classes/CustomIdentifier';

export type Game = {
    id: number
    name: string
    url: string
    currentReleaseStatus: number
    release_dates?: number[]
    nextReleaseDate?: number
    nextReleaseStatus?: number
    cover: number
    userDescription?: string
    websites: number[]
}

export type ReleaseDate = {
    id: number
    game: number
    status: number
    date: number
}



class IGDBApi {
    
    

    static gameFields = [
        'id',
        'name',
        'url',
        'release_dates',
        'cover',
        'websites'
    ].join(',');

    static baseUrl = 'https://api.igdb.com/v4';

    static async post(url: string, data: string) {
        return await axios.post(
            url,
            data,
            {
                headers: {
                    'Client-ID': Bot.getInstance().twitchAccessTokenHandler.clientId,
                    'Authorization': `Bearer ${await Bot.getInstance().twitchAccessTokenHandler.getAccessToken()}`,
                }
            });
    }

    static async searchGames(ids: number[]): Promise<Game[]> {
        const url = `${IGDBApi.baseUrl}/games`;
        const response = await IGDBApi.post(
            url,
            `fields ${this.gameFields};
            where id = (${ids.join(',')});`);
        let games: Game[] = response.data;
        
        games = await this.addCurrentReleases(games)
        games = await this.addNextReleases(games)
        return games;
    }

    static async addCurrentReleases(games: Game[]): Promise<Game[]> {
        const currentReleases = await this.getCurrentReleases(games);
        games.forEach(game => {
            const currentRelease = currentReleases?.find(release => release.game === game.id);
            if (currentRelease) game.currentReleaseStatus = currentRelease?.status;
        });
        return games;
    }

    static async addNextReleases(games: Game[]): Promise<Game[]> {
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

    static async presearchGame(query: string): Promise<Game[]> {
        const url = `${IGDBApi.baseUrl}/games`;
        let response = await IGDBApi.post(
            url,
            `search "${query}";
            fields ${this.gameFields};
            limit 5;`,);
        if (!response.data?.length) return [];
        let games: Game[] = response.data;
        games = await this.addNextReleases(games)
        return games;
    }

    static async enrichGameData(game: Game): Promise<Game> {
        const currentRelease = await this.getCurrentRelease(game?.release_dates?.map(id => id.toString()) ?? []);
        if (currentRelease) game.currentReleaseStatus = currentRelease.status;

        const releaseDate = await this.getNextReleaseDate(game?.release_dates?.map(id => id.toString()) ?? []);
        if (releaseDate) {
            game.nextReleaseDate = releaseDate.date;
            game.nextReleaseStatus = releaseDate.status;
        }

        const steamUrl = await this.getSteamUrl(game?.websites);
        if (steamUrl) game.url = steamUrl;

        return game;
    }

    static async getGameById(id: number) {
        const url = `${IGDBApi.baseUrl}/games`;
        let response = await IGDBApi.post(
            url,
            `fields ${this.gameFields};
            where id = ${id};
            limit 1;`,);
        if (!response.data.length) return undefined;
        let game: Game = response.data[0]
        if (!game?.release_dates?.length) return game;
        game = await this.enrichGameData(game);
        return game;
    }

    static async searchGame(query: string): Promise<Game | undefined> {
        const url = `${IGDBApi.baseUrl}/games`;
        let response = await IGDBApi.post(
            url,
            `search "${query}";
            fields ${this.gameFields};
            where first_release_date > ${Math.floor(Date.now() / 1000)};
            limit 1;`,);
        if (!response.data.length) {
            response = await IGDBApi.post(
                url,
                `search "${query}";
                fields ${this.gameFields};
                limit 1;`);
        }
        if (!response.data.length) return undefined;
        let game: Game = response.data[0]
        if (!game?.release_dates?.length) return game;
        game = await this.enrichGameData(game);
        return game;

    }

    static async getSteamUrl(id: number[]): Promise<string | undefined> {
        if (!id?.length) return Promise.resolve(undefined);
        const url = `${IGDBApi.baseUrl}/websites`;
        let response = await IGDBApi.post(
            url,
            `fields url;
            where id = (${id.join(",")}) & category = 13;
            limit 1;`);
        return response.data?.[0]?.url
    }


    static async getNextReleaseDates(games: Game[]): Promise<ReleaseDate[] | undefined> {
        const releaseDates = games.filter(game=>game?.release_dates).map(game => game.release_dates).flat()
        if (!releaseDates?.length) return Promise.resolve(undefined);
        const url = `${IGDBApi.baseUrl}/release_dates`;
        let response = await IGDBApi.post(
            url,
            `fields id,game,status,date;
            where platform = 6 & id = (${releaseDates.join(',')}) & date > ${Math.floor(Date.now() / 1000)};`);
        return response.data as ReleaseDate[];
    }

    static async getCurrentReleases(games: Game[]): Promise<ReleaseDate[] | undefined> {
        const releaseDates = games.filter(game=>game?.release_dates).map(game => game.release_dates).flat()
        if (!releaseDates?.length) return Promise.resolve(undefined);
        const url = `${IGDBApi.baseUrl}/release_dates`;
        let response = await IGDBApi.post(
            url,
            `fields id,game,status,date;
            where platform = 6 & id = (${releaseDates.join(',')}) & date < ${Math.floor(Date.now() / 1000)};`);
        return response.data as ReleaseDate[];
    }


    static async getNextReleaseDate(releaseDateIDs: string[]): Promise<ReleaseDate | undefined> {
        if (!releaseDateIDs?.length) return Promise.resolve(undefined);
        const url = `${IGDBApi.baseUrl}/release_dates`;
        let response = await IGDBApi.post(
            url,
            `fields id,game,status,date;
            where platform = 6 & id = (${releaseDateIDs.join(',')}) & date > ${Math.floor(Date.now() / 1000)};
            limit 1;`);
        return response.data?.[0]
    }

    static async getCurrentRelease(releaseDateIDs: string[]): Promise<ReleaseDate | undefined> {
        if (!releaseDateIDs?.length) return Promise.resolve(undefined);
        const url = `${IGDBApi.baseUrl}/release_dates`;
        let response = await IGDBApi.post(
            url,
            `fields id,game,status,date;
            where platform = 6 & id = (${releaseDateIDs.join(',')}) & date < ${Math.floor(Date.now() / 1000)};
            sort date desc;
            limit 1;`);
        return response.data?.[0]
    }

    static statusToString(status: number): string {
        return ["Onbekend", "Alpha", "Beta", "Early Access", "Offline", "Cancelled", "Full Release"][status]
    }

    static async searchGameCover(cover: number): Promise<string | undefined> {
        if (!cover) return Promise.resolve(undefined);
        const url = `${IGDBApi.baseUrl}/covers`;
        let response = await IGDBApi.post(
            url,
            `fields url;
            where id = ${cover};
            limit 1;`);
        return response.data?.[0]?.url
    }


}

export default IGDBApi;
