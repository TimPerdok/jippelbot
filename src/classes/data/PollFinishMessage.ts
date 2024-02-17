import { Embed, EmbedBuilder, GuildMember, MessageEditOptions, MessagePayload, User } from "discord.js"
import { PollJSON } from "../../types/PollJSON"
import Sobject from "./Sobject"
import { VoteAction, VoteActions } from "./VoteActions"
import Poll from "./Poll"

export default class PollFinishMessage {

    static async create(poll: Poll<VoteAction>, user: GuildMember): Promise<MessageEditOptions | undefined> {
        if (!user) return;
        const guild = user.client.guilds.cache.get(poll.guildId)
        if (!guild) return;
        const username = guild?.members.cache.get(poll.initiator)?.displayName ??  (await guild.members.fetch(poll.initiator)).displayName
        return poll.hasPassed
        ? { content: `${username} wou ${poll.action.question}. Deze vote is wel doorgevoerd. ${poll.yesCount} voor, ${poll.noCount} tegen. (${poll.percentage})`, embeds: [], components: []}
        : { content: `${username} wou ${poll.action.question}. Deze vote is niet doorgevoerd. ${poll.yesCount} voor, ${poll.noCount} tegen. (${poll.percentage})`, embeds: [], components: [] }
    }
    

    

}