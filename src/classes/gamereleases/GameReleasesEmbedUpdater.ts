import { Embed, Message, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import { Game } from "../../api/IGDB";
import IGDBApi from "../../api/IGDBApi";
import { ServerConfig } from "../../types/ServerdataJSON";
import { createEmbed } from "../../util/util";
import DiscordBot from "../Bot";
import { Interval } from "../Scheduler";
import JSONDataHandler from "../datahandlers/JSONDataHandler";
import ScheduledAction from "../schedulers/ScheduledAction";


export default class GameReleasesEmbedUpdater extends ScheduledAction {
   
    gameDataHandler: JSONDataHandler<Game[]>;
    serverdataHandler: JSONDataHandler<ServerConfig>;

    constructor(private serverId: string) {
        super({ callback: () => this.run(), at: Interval.DAILY})
        this.gameDataHandler = DiscordBot.getInstance().dataHandlers.gameSubscriptions as JSONDataHandler<Game[]>;
        this.serverdataHandler = DiscordBot.getInstance().dataHandlers.serverdata as JSONDataHandler<ServerConfig>;
        this.run()
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
        console.log("embed", embed)
        return { embeds: [embed] }
    }


    async run() {
        // Update all games
        const games = await this.gameDataHandler.getAllOfServer(this.serverId);
        const newGames = await IGDBApi.searchGames(games.map((game) => game.id));
        const mergedGames = games.map((game) => {
            const subscribedGame = newGames.find((newGame) => newGame.id === game.id);
            return {
                ...game,
                ...subscribedGame
            } as Game
        })
        await this.gameDataHandler.overwrite(this.serverId, mergedGames);
        // Update release embed
        const message = await this.getMessage();
        const content = await this.getContent();
        if (message) return message.edit(content)
        this.createMessage() 
    }

}
