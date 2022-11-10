import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, embedLength, Guild, GuildMember, MessageReference } from "discord.js";
import DiscordBot from "./Bot";
import DataHandler from "./DataHandler";
import Subcommand from "./Subcommand";

export default class Poll {

    subcommand: string
    question: string;
    initiator: any;

    message: any;

    votes = new Map<string, boolean>();
    startTimestampUnix: number;

    maxTime = 86400

    minimumPercentage = 0.50

    get timeLeft() {
        return (this.startTimestampUnix + this.maxTime) * 1000 - Date.now()
    }

    constructor(question: string, initiator: any, subcommand: string, startTimestampUnix?: number, votes?: Map<string, boolean>, message?: MessageReference) {
        this.question = question
        this.initiator = initiator
        this.subcommand = subcommand
        this.startTimestampUnix = startTimestampUnix ?? Math.round(Date.now() / 1000)
        if (votes) this.votes = votes
        if (message) this.message = message
        setTimeout(async () => {
            DataHandler.removePoll(this.message.id)
            if (this.percentage > this.minimumPercentage) this.onPass(this)
            else this.onFail(this)
        }, this.timeLeft > 0 ? this.timeLeft : 0)
    }

    onPass(poll: Poll) { }
    onFail(poll: Poll) { }

    get voteCount() {
        return [...this.votes.values()].length
    }

    get percentage(): number {
        if (!this.yesCount && !this.noCount) return 0
        const pct = this.yesCount / (this.yesCount + this.noCount)
        if (!isNaN(pct)) return pct
        return 0
    }

    get percentageLabel() {
        return `${Math.round(this.percentage * 100)}%`
    }

    get yesCount(): number {
        return [...this.votes.values()].filter((vote) => vote).length
    }

    get noCount(): number {
        return [...this.votes.values()].filter((vote) => !vote).length
    }

    setRef(message: any) {
        this.message = message
        DataHandler.setPoll(this.toJSON())
    }

    addCount(user: GuildMember, value: boolean = false) {
        this.votes.set(user.id, value)
        DataHandler.setPoll(this.toJSON())
    }

    getEndTime() {
        return `<t:${this.startTimestampUnix + this.maxTime}>`
    }

    getEmbed() {
        return {
            embeds: [new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${this.initiator.nickname ?? this.initiator.user.username} heeft een vote gestart.`)
                .setDescription(this.question)
                .addFields(
                    { name: 'Voor:', value: this.yesCount + "", inline: true },
                    { name: 'Tegen:', value: this.noCount + "", inline: true },
                    { name: 'Totaal:', value: this.percentageLabel + "", inline: true },
                    { name: 'Vote eindigt op:', value: this.getEndTime() },
                )
            ]
            , components: [new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('yes')
                        .setLabel('Ja')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('no')
                        .setLabel('Nee')
                        .setStyle(ButtonStyle.Danger),
                )]
        }

    }

    async update(interaction: any) {
        await this.message.edit(this.getEmbed())
        await interaction.update({ fetchReply: true })
    }


    toJSON() {
        return {
            question: this.question,
            initiator: this.initiator.user.id,
            votes: Object.fromEntries(this.votes),
            startTimestampUnix: this.startTimestampUnix,
            subcommand: this.subcommand,
            messageId: this.message.id,
            channelId: this.message.channelId,
        }
    }

}
