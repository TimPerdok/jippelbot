import { Channel, TextChannel } from "discord.js"
import { PollJSON } from "../../types/PollJSON"
import DiscordBot from "../Bot"
import Sobject from "./Sobject"
import { VoteAction, VoteActions } from "./VoteActions"
import PollFinishMessage from "./PollFinishMessage"

export default class Poll<T extends VoteAction> extends Sobject {
    
    static MIN_VOTES = 1
    
    get percentage(): string {
        const pct = this.yesCount / (this.yesCount + this.noCount)
        if (isNaN(pct)) return "0%"
        return Math.round(pct * 100) + "%"
    }

    constructor(public action: T,
        public yesCount: number,
        public noCount: number,
        public endDate: number,
        public initiator: string,
        public id: string, // message ID
        public channelId: string,
        public votedUsers: string[] = []) {
        super()
    }

    get guildId(): string {
        const channel: Channel | undefined = DiscordBot.client.channels.cache.get(this.channelId)
        if (!channel) return ""
        return (channel as TextChannel).guild.id
    }

    addVote(userId: string, isYes: boolean = true) {
        if (this.votedUsers.includes(userId)) return;
        this.votedUsers.push(userId)
        if (isYes) this.yesCount++
        else this.noCount++
        if (this.hasPassed) return this.finish()
        DiscordBot.getInstance().dataHandlers.poll.set(this.guildId, this.toJSON())
    }

    async finish() {
        const guild = DiscordBot.client.guilds.cache.get(this.guildId)
        if (!guild) return console.error("no guild")
        const channel: TextChannel | undefined = DiscordBot.client.channels.cache.get(this.channelId) as TextChannel | undefined
        if (!channel) return console.error("no channel")
        const message = await channel.messages.fetch(this.id)
        const user = await guild.members.fetch(this.initiator)
        if (!user) return console.error("no user")
        const pollFinishMessage = await PollFinishMessage.create(this, user)
        if (!pollFinishMessage) return console.error("no pollFinishMessage")
        message.edit(pollFinishMessage)
        DiscordBot.getInstance().dataHandlers.poll.remove(guild.id, this.id)
        await DiscordBot.getInstance().getServerById(guild.id)?.voteScheduler.reschedule()
    }

    toJSON(): PollJSON<VoteAction> {
        return {
            action: this.action,
            yesCount: this.yesCount,
            noCount: this.noCount,
            endDate: this.endDate,
            initiator: this.initiator,
            id: this.id,
            channelId: this.channelId,
            question: this.action.question,
            votedUsers: this.votedUsers
        }
    }

    save(id: string) {
        this.id = id
        DiscordBot.getInstance().dataHandlers.poll.add(this.guildId, this.toJSON())
        DiscordBot.getInstance().servers.find((server) => server.guild.id === this.guildId)?.voteScheduler.addPoll(this)
    }

    static fromItem<Type extends VoteAction>(obj: PollJSON<Type>): Poll<Type> {
        return new Poll(obj.action, obj.yesCount, obj.noCount, obj.endDate, obj.initiator, obj.id, obj.channelId, obj.votedUsers)
    }

    get expired(): boolean {
        return this.endDate < Date.now() / 1000
    }

    get hasPassed(): boolean {
        return this.yesCount > this.noCount && this.yesCount > 0 && this.yesCount >= Poll.MIN_VOTES
    }

    static new(action: VoteAction, endDate: number, initiator: string, channelId: string) {
        return new Poll(action, 0, 0, endDate, initiator, "", channelId)
    }


}