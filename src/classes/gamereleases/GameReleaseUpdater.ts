import { Interval } from "../Scheduler";
import DiscordBot from "../Bot";
import { Embed, TextChannel } from "discord.js";
import IGDBApi from "../../api/IGDBApi";
import { createEmbed } from "../../util/util";
import JSONDataHandler, { ServerScoped } from "../datahandlers/JSONDataHandler";
import ScheduledMessageUpdater, { Schedule } from "../messageupdaters/ScheduledMessageUpdater";
import { Game } from "../../api/IGDB";
import { ServerdataJSON } from "../../types/ServerdataJSON";


export default class GameReleaseUpdater extends ScheduledMessageUpdater {
    gameDataHandler: JSONDataHandler<Game[]>;
    serverdataHandler: JSONDataHandler<ServerdataJSON>;

    constructor() {
        super()
        this.gameDataHandler = DiscordBot.getInstance().dataHandlers.gameSubscriptions as JSONDataHandler<Game[]>;
        this.serverdataHandler = DiscordBot.getInstance().dataHandlers.serverdata as JSONDataHandler<ServerdataJSON>;
        this.addSchedules([
            { callback: this.updateGameSubscriptions, at: Interval.DAILY },
        ])
        this.createGameReleaseSchedules().then((schedules) => this.addSchedules(schedules))
        this.updateGameSubscriptions()
        
    }


    async fetchNewGames(gamesPerServer: ServerScoped<Game[]>) {
        const allGameIds = Object.values(gamesPerServer).flatMap((games) => games.map((game) => game.id));
        if (!allGameIds.length) return console.log("No games to update");
        const newGames = await IGDBApi.searchGames(allGameIds);
        return Object.fromEntries(Object.entries(gamesPerServer).map(([serverId, oldGames]: [string, Game[]]) => {
            const games = oldGames.map((game) => {
                const newGame = newGames.find((newGame) => newGame.id === game.id) || game
                return { ...game, ...newGame }
            })
            return [serverId, games] as [string, Game[]];
        })) as ServerScoped<Game[]>;

    }

    async updateGameSubscriptions() {
        let gamesPerServer = await this.gameDataHandler.getAll();
        gamesPerServer = await this.fetchNewGames(gamesPerServer) ?? gamesPerServer;
        
        // Update database with latest game info
        await this.gameDataHandler.overwriteAll(gamesPerServer);
        // Remove games that are already released
        await this.removeOldGames(gamesPerServer)
        // Update discord bot messages
        await this.updateMessages()
    }

    removeOldGames(newAllGamesServer: ServerScoped<Game[]>) {
        const newGames = Object.entries(newAllGamesServer)
            .map(([serverId, games]) => ([
                serverId,
                games.filter((game) => !game?.nextReleaseDate
                    || game.nextReleaseDate > Math.floor(Date.now() / 1000))
                ])) as [string, Game[]][];
        return this.gameDataHandler.overwriteAll( Object.fromEntries(newGames) as ServerScoped<Game[]> )
    }

    async updateMessages() {
        let allGames = await this.gameDataHandler.getAll();
        Object.entries(allGames).forEach(async ([serverId, games]: [string, Game[]]) => {
            try {
                const serverdata = await this.serverdataHandler.get(serverId);

                const embed = await createEmbed(games) as Embed;
                const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
                
                if (!channel) return;
                const messages = await channel.messages.fetch({ limit: 25 })
                const message = messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length > 0)
                message
                    ? message.edit({ embeds: [embed] })
                    : channel.send({ embeds: [embed] })
            } catch (error) {
                console.error(error)
            }
        })
    }



    async createGameReleaseSchedules(): Promise<Schedule[]> {
        const allGamesPerServer = await this.gameDataHandler.getAll();
        return Object.entries(allGamesPerServer).flatMap(([serverId, games]: [string, Game[]]) => {
            return games
                .filter((game) => !!game?.nextReleaseDate)
                .map((game) => ({
                    callback: () => this.sendGameReleaseAlert(serverId, game),
                    at: new Date((game.nextReleaseDate ?? 0) * 1000)
                } as Schedule))
        })
    }

    async sendGameReleaseAlert(serverId: string, game: Game) {
        const serverdata = await this.serverdataHandler.get(serverId);
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        if (!channel) return;
        const messages = await channel.messages.fetch({ limit: 25 })
        const message = messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length == 0)
        message?.delete()
        channel.send({ content: `**${game.name} is gereleased!**` })
    }

}
