import { Interval } from "../Scheduler";
import DiscordBot from "../Bot";
import { Embed, Message, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import IGDBApi from "../../api/IGDBApi";
import { createEmbed } from "../../util/util";
import JSONDataHandler, { ServerScoped } from "../datahandlers/JSONDataHandler";
import ScheduledAction, { Schedule } from "../schedulers/messageupdaters/ScheduledActionWrapper";
import { Game } from "../../api/IGDB";
import { ServerConfig } from "../../types/ServerdataJSON";


export default class GameReleasesEmbedUpdater extends ScheduledAction {
   
    gameDataHandler: JSONDataHandler<Game[]>;
    serverdataHandler: JSONDataHandler<ServerConfig>;

    constructor(private serverId: string) {
        super({ callback: () => this.run, at: Interval.DAILY})
        this.gameDataHandler = DiscordBot.getInstance().dataHandlers.gameSubscriptions as JSONDataHandler<Game[]>;
        this.serverdataHandler = DiscordBot.getInstance().dataHandlers.serverdata as JSONDataHandler<ServerConfig>;
    }

    async createMessage() {
        const serverdata = await this.serverdataHandler.getAllOfServer(this.serverId);
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        const content = await this.getContent();
        return channel.send(content as any)
    }

    async getMessage(): Promise<Message | undefined> {
        const serverdata = await this.serverdataHandler.getAllOfServer(this.serverId);
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        const messages = await channel.messages.fetch({ limit: 25 })
        return messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length > 0)
    }

    async getContent(): Promise<string | MessageEditOptions | MessagePayload> {
        const games = await this.gameDataHandler.getAllOfServer(this.serverId);
        const embed = await createEmbed(games) as Embed;
        return { embeds: [embed] }
    }


    async run() {
        let subscribedGames = await this.gameDataHandler.getAllOfServer(this.serverId);
        subscribedGames = subscribedGames.filter((game) =>
                !game?.nextReleaseDate
                || game.nextReleaseDate > Math.floor(Date.now() / 1000
            ))
        subscribedGames = await IGDBApi.searchGames(subscribedGames.map((game) => game.id));
        await this.gameDataHandler.overwrite(this.serverId, subscribedGames);
        const message = await this.getMessage();
        const content = await this.getContent();
        if (message) return message.edit(content)
        this.createMessage() 
    }

    

    // async createGameReleaseSchedules(): Promise<Schedule[]> {
    //     const allGamesPerServer = await this.gameDataHandler.getAll();
    //     return Object.entries(allGamesPerServer).flatMap(([serverId, games]: [string, Game[]]) => {
    //         return games
    //             .filter((game) => !!game?.nextReleaseDate)
    //             .map((game) => ({
    //                 callback: () => this.sendGameReleaseAlert(serverId, game),
    //                 at: new Date((game.nextReleaseDate ?? 0) * 1000)
    //             } as Schedule))
    //     })
    // }

    // async sendGameReleaseAlert(serverId: string, game: Game) {
    //     const serverdata = await this.serverdataHandler.get(serverId);
    //     const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
    //     if (!channel) return;
    //     const messages = await channel.messages.fetch({ limit: 25 })
    //     const message = messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length == 0)
    //     message?.delete()
    //     channel.send({ content: `**${game.name} is gereleased!**` })
    // }

}
