import { Embed, EmbedBuilder, User } from "discord.js"
import { PollJSON } from "../../types/PollJSON"
import Sobject from "./Sobject"
import { VoteAction, VoteActions } from "./VoteActions"
import Poll from "./Poll"

export default class PollEmbed {

    static fromEmbed(embed: Embed, poll: Poll<VoteAction>) {
        const newEmbed = new EmbedBuilder()
            .setTitle(embed.title)
            .setDescription(embed.description)
            .addFields([
                {
                    name: "Ja",
                    value: poll.yesCount.toString(),
                    inline: true
                },
                {
                    name: "Nee",
                    value: poll.noCount.toString(),
                    inline: true
                },
                {
                    name: "Percentage",
                    value: poll.percentage,
                    inline: true
                }
            ])
        return newEmbed
    }

    static create(poll: Poll<VoteAction>, user: User) {
        return new EmbedBuilder()
            .setTitle(`${user.username} wil ${poll.action.question}`)
            .setDescription(`Ends <t:${poll.endDate}:R>`)
            .addFields([
                {
                    name: "Ja",
                    value: poll.yesCount.toString(),
                    inline: true
                },
                {
                    name: "Nee",
                    value: poll.noCount.toString(),
                    inline: true
                },
                {
                    name: "Percentage",
                    value: poll.percentage,
                    inline: true
                }
            ])
    }
    

    

}