import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, embedLength, Guild, GuildMember, Interaction, Message, MessageEditOptions, MessagePayload, MessageReference } from "discord.js";
import MessageCarrier, { Payload } from "../interfaces/MessageCarrier";
import DataHandler from "./DataHandler";

export type PollJSON = {
    question: string
    initiator: string
    votes: {
        [key: string]: boolean
    }
    startTimestampUnix: number
    subcommand: string
    messageId: string
    channelId: string
};

export default class Poll implements MessageCarrier {

    subcommand: string
    question: string;
    initiator: GuildMember;

    message: Message;

    votes: Map<string, boolean>
    startTimestampUnix: number;

    maxTime = 86400

    minimumPercentage = 0.50

    get timeLeft(): number {
        return (this.startTimestampUnix + this.maxTime) * 1000 - Date.now()
    }

    constructor(question: string, initiator: any, subcommand: string, startTimestampUnix?: number, votes: Map<string, boolean> = new Map<string, boolean>(), message: Message = null) {
        this.question = question
        this.initiator = initiator
        this.subcommand = subcommand
        this.startTimestampUnix = startTimestampUnix ?? Math.round(Date.now() / 1000)
        this.votes = votes
        this.message = message
        setTimeout(async () => {
            DataHandler.removePoll(this.message.id)
            if (this.percentage > this.minimumPercentage) this.onPass(this)
            else this.onFail(this)
        }, this.timeLeft > 0 ? this.timeLeft : 0)
    }



    onPass(poll: Poll) { }
    onFail(poll: Poll) { }

    get voteCount(): number {
        return [...this.votes.values()].length
    }

    get percentage(): number {
        if (!this.yesCount && !this.noCount) return 0
        const pct = this.yesCount / (this.yesCount + this.noCount)
        if (!isNaN(pct)) return pct
        return 0
    }

    get percentageLabel(): string {
        return `${Math.round(this.percentage * 100)}%`
    }

    get yesCount(): number {
        return [...this.votes.values()].filter((vote) => vote).length
    }

    get noCount(): number {
        return [...this.votes.values()].filter((vote) => !vote).length
    }

    updateData(): void {
        DataHandler.setPoll(this.format())
    }

    setRef(message: any): void {
        this.message = message
        this.updateData()
    }

    addCount(user: GuildMember, value: boolean = false): void {
        this.votes.set(user.id, value)
        this.updateData()
    }

    getEndTime(): string {
        return `<t:${this.startTimestampUnix + this.maxTime}>`
    }

    get payload(): Payload {
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
            ], components: [
                new ActionRowBuilder()
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

    async updateMessage(interaction: ButtonInteraction) {
        await this.message.edit(this.payload)
        interaction.update({ fetchReply: true })
    }

    format(): PollJSON {
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
