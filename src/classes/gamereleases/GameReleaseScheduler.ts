import { Interval } from "../Scheduler";
import DiscordBot from "../Bot";
import { Embed, Guild, Message, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import IGDBApi from "../../api/IGDBApi";
import { createEmbed } from "../../util/util";
import JSONDataHandler, { ServerScoped } from "../datahandlers/JSONDataHandler";
import ScheduledActionWrapper, { Schedule } from "../messageupdaters/ScheduledMessageUpdaterAbstr";
import { Game } from "../../api/IGDB";
import { ServerConfig } from "../../types/ServerdataJSON";
import ScheduledAction from "../messageupdaters/ScheduledMessageUpdater";


export default class GameReleaseScheduler  {
    scheduledActions: ScheduledAction[];
   

    constructor(private guild: Guild) {
        this.scheduledActions = this.createScheduledActions()
    }

    createScheduledActions() {
        const toBeReleasedGames = DiscordBot.getInstance().dataHandlers.gameSubscriptions.getOfServer(this.guild.id)
            .filter((game) => !!game?.nextReleaseDate)
        return toBeReleasedGames.map((game) => new ScheduledAction({
            callback: () => this.sendGameReleaseAlert(game),
            at: new Date((game.nextReleaseDate ?? 0) * 1000)
        }))
    }

    unschedule() {
        this.scheduledActions.forEach((action) => action.stop())
    }

    reschedule() {
        this.unschedule()
        this.scheduledActions = this.createScheduledActions()
    }

    async sendGameReleaseAlert(game: Game) {
        const serverdata = DiscordBot.getInstance().dataHandlers.serverdata.getOfServer(this.guild.id)
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        if (!channel) return;
        const messages = await channel.messages.fetch({ limit: 25 })
        const message = messages.find((message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length == 0)
        message?.delete()
        channel.send({ content: `**${game.name} is gereleased!**` })
    }

}
