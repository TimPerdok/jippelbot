import { Guild, Message, TextChannel } from "discord.js";
import { Game } from "../../api/IGDB";
import DiscordBot from "../Bot";
import { doWithLock } from "../Lock";
import Scheduler, { ScheduledAction } from "../Scheduler";


export default class GameReleaseManager  {
   
    private scheduler: Scheduler;

    constructor(private guild: Guild) {
        this.scheduler = new Scheduler(this.createScheduledActions(), "GameReleaseScheduler");
    }

    createScheduledActions(): ScheduledAction[] {
        const toBeReleasedGames = DiscordBot.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(this.guild.id)
            .filter((game) => !!game?.nextReleaseDate)
        
        return toBeReleasedGames.map((game) => {
            const releaseDate = new Date((game.nextReleaseDate ?? 0) * 1000)
            return {
                callback: () => this.releaseGame(game),
                rule: releaseDate < new Date()
                        ? new Date(new Date().getTime() + 3000)
                        : releaseDate
            }
        })
    }

    async releaseGame(game: Game) {
        const serverdata = DiscordBot.getInstance().dataHandlers.serverdata.getAllOfServer(this.guild.id)
        const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel) as TextChannel;
        if (!channel) return;
        await doWithLock('deleteOldGameReleaseMessageLock', () => {
            return this.removeOldMessages(channel)
        })
        await channel.send({ content: `**${game.name} is gereleased!**` })
        DiscordBot.getInstance().dataHandlers.gameSubscriptions.remove(this.guild.id, game.id)
    }

    async removeOldMessages(channel: TextChannel) {
        let messages = await channel.messages.fetch({ limit: 25 })
        messages = messages.filter((message: Message) => message.author.id === DiscordBot.client.user?.id && message.embeds.length == 0)
        for (const message of messages.values()) {
            await message.delete()
        }
    }

}
