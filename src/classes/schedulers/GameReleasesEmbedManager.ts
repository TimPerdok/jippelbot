import { Embed, Message, MessageCreateOptions, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import { Game } from "../../api/IGDB";
import IGDBApi from "../../api/IGDBApi";
import { ServerConfig } from "../../types/ServerdataJSON";
import { createEmbed } from "../../util/util";
import DiscordBot from "../Bot";
import Scheduler, { Interval, ScheduledAction } from "../Scheduler";
import JSONDataHandler from "../datahandlers/JSONDataHandler";


export default class GameReleaseEmbedManager {
    scheduler: Scheduler;
    gameDataHandler: JSONDataHandler<Game[]>;
    serverdataHandler: JSONDataHandler<ServerConfig>;

    constructor(private serverId: string) {
        const dataHandlers = DiscordBot.getInstance().dataHandlers;
        this.gameDataHandler = dataHandlers.gameSubscriptions as JSONDataHandler<Game[]>;
        this.serverdataHandler = dataHandlers.serverdata as JSONDataHandler<ServerConfig>;

        this.scheduler = new Scheduler([{ callback: this.refresh, rule: Interval.DAILY }], "GameReleaseEmbedManager");
        this.refresh();
    }

    private async getMessage(): Promise<Message | undefined> {
        const channel = await this.getReleaseChannel();
        const messages = await channel.messages.fetch({ limit: 25 })
        return messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length > 0)
    }

    private async getContent(): Promise<MessageCreateOptions> {
        const games = await this.gameDataHandler.getAllOfServer(this.serverId);
        const embed = await createEmbed(games) as Embed;
        return { embeds: [embed] }
    }

    private async getReleaseChannel(): Promise<TextChannel> {
        const serverdata = await this.serverdataHandler.getAllOfServer(this.serverId);
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        return channel;
    }

    public async refresh() {
        // Update all games
        this.updateGames()
        // Update the embed message
        this.updateMessage()
    }

    private async updateGames() {
        const games = this.gameDataHandler.getAllOfServer(this.serverId);
        const updatedGames = await IGDBApi.searchGames(games.map((game) => game.id));
        this.gameDataHandler.overwrite(this.serverId,
            games.map((game) => ({
                ...game,
                ...updatedGames.find((newGame) => newGame.id === game.id)
            })));
    }

    private async updateMessage() {
        const content = await this.getContent();
        const message = await this.getMessage();
        if (message) return message.edit(content as MessageEditOptions);
        const channel = await this.getReleaseChannel();
        return channel.send(content)
    }

}
