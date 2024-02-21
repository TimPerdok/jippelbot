import { Interval } from "../Scheduler";
import DiscordBot from "../Bot";
import { Embed, Guild, Message, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import IGDBApi from "../../api/IGDBApi";
import { createEmbed } from "../../util/util";
import JSONDataHandler, { ServerScoped } from "../datahandlers/JSONDataHandler";
import ScheduledAction, { Schedule } from "./ScheduledActionWrapper";
import { Game } from "../../api/IGDB";
import { ServerConfig } from "../../types/ServerdataJSON";


export default class GameReleaseScheduler  {
    scheduledActions: ScheduledAction[];
   

    constructor(private guild: Guild) {
        this.scheduledActions = this.createScheduledActions()
    }

    createScheduledActions() {
        
        const toBeReleasedGames = DiscordBot.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(this.guild.id)
            .filter((game) => !!game?.nextReleaseDate)
        
        return toBeReleasedGames.map((game) => {
            console.log(`Scheduling ${game.name} to be released at ${new Date((game.nextReleaseDate ?? 0) * 1000)}`)
            const releaseDate = new Date((game.nextReleaseDate ?? 0) * 1000)
            return new ScheduledAction({
                callback: () => this.releaseGame(game),
                at: releaseDate < new Date() ? new Date(new Date().getTime() + 3000) : releaseDate
            })
        })
    }

    unschedule() {
        this.scheduledActions.forEach((action) => action.stop())
    }

    reschedule() {
        this.unschedule()
        this.scheduledActions = this.createScheduledActions()
    }

    async releaseGame(game: Game) {
        console.log(`Sending release alert for ${game.name}`)
        const serverdata = DiscordBot.getInstance().dataHandlers.serverdata.getAllOfServer(this.guild.id)
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        if (!channel) return;
        const messages = await channel.messages.fetch({ limit: 25 })
        const message = messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length == 0)
        message?.delete()
        channel.send({ content: `**${game.name} is gereleased!**` })
        DiscordBot.getInstance().dataHandlers.gameSubscriptions.remove(this.guild.id, game.id)
    }

}
