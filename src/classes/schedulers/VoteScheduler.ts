import { Interval } from "../Scheduler";
import DiscordBot from "../Bot";
import { Channel, Embed, Guild, Message, MessageEditOptions, MessagePayload, TextChannel } from "discord.js";
import IGDBApi from "../../api/IGDBApi";
import { createEmbed } from "../../util/util";
import JSONDataHandler, { ServerScoped } from "../datahandlers/JSONDataHandler";
import ScheduledAction, { Schedule } from "./messageupdaters/ScheduledActionWrapper";
import { Game } from "../../api/IGDB";
import { ServerConfig } from "../../types/ServerdataJSON";
import Poll from "../data/Poll";
import { VoteAction } from "../data/VoteActions";


export default class VoteScheduler  {

    scheduledActions: ScheduledAction[];

    constructor(private guild: Guild) {
        this.scheduledActions = this.createScheduledActions()
        console.log(this.scheduledActions)
    }

    createScheduledActions() {
        const polls = DiscordBot.getInstance().dataHandlers.poll.getAllOfServer(this.guild.id).map((poll) => Poll.fromItem(poll))
        return polls.map((poll) => new ScheduledAction({
            callback: () => this.finishPoll(poll),
            at: new Date((poll.endDate * 1000))
        }))
    }

    addPoll(poll: Poll<VoteAction>) {
        this.scheduledActions.push(new ScheduledAction({
            callback: () => this.finishPoll(poll),
            at: new Date((poll.endDate * 1000))
        }))
    }

    async finishPoll(poll: Poll<VoteAction>) {
        const guild = DiscordBot.client.guilds.cache.get(poll.guildId)
        if (!guild) return console.error("no guild")
        const channel: TextChannel | undefined = DiscordBot.client.channels.cache.get(poll.channelId) as TextChannel | undefined
        if (!channel) return console.error("no channel")
        const message = await channel.messages.fetch(poll.id)
        const username = guild?.members.cache.get(poll.initiator)?.displayName ??  (await guild.members.fetch(poll.initiator)).displayName
        if (poll.hasPassed) message.edit({ content: `${username} wou ${poll.action.question}. Deze vote is wel doorgevoerd. ${poll.yesCount} voor, ${poll.noCount} tegen. (${poll.percentage})`, embeds: [], components: []})
        else message.edit({ content: `${username} wou ${poll.action.question}. Deze vote is niet doorgevoerd. ${poll.yesCount} voor, ${poll.noCount} tegen. (${poll.percentage})`, embeds: [], components: [] })
        DiscordBot.getInstance().dataHandlers.poll.remove(guild.id, poll.id)
    }

}


