import { ActionRow, ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonInteraction, ButtonStyle, Channel, ChannelType, EmbedBuilder, embedLength, Guild, GuildMember, Interaction, Message, MessageEditOptions, MessagePayload, MessageReference, TextChannel, VoiceChannel } from "discord.js";
import MessageCarrier, { DataJSON, Payload } from "../interfaces/MessageCarrier";
import { PollSubcommand } from "../types/PollSubcommand";
import Classfinder from "./Classfinder";
import DataHandler from "./datahandlers/DataHandler";
import Subcommand from "./Subcommand";

export type PollConfig = {
    question: string,
    initiator: GuildMember,
    command: PollSubcommand,
    params: {
        [key: string]: any
    }
    message?: Message
    startTimestampUnix?: number,
    votes?: Map<string, boolean>
}

export default class Poll implements MessageCarrier {

    command: PollSubcommand
    question: string;
    initiator: GuildMember;

    message: Message;

    votes: Map<string, boolean>
    startTimestampUnix: number;

    maxTime = 86400

    minimumPercentage = 0.50

    params: { [key: string]: string } = {};
    done: boolean = false;

    get timeLeft(): number {
        return (this.startTimestampUnix + this.maxTime) * 1000 - Date.now()
    }

    constructor({ question, initiator, command, params, startTimestampUnix, votes, message }: PollConfig) {
        this.question = question
        this.initiator = initiator
        this.command = command
        this.startTimestampUnix = startTimestampUnix ?? Math.round(Date.now() / 1000)
        this.votes = votes ?? new Map()
        this.message = message
        this.params = params
        if (message) this.updateData()
        setTimeout(async () => {
            if (this.done) return
            this.done = true
            if (this.percentage > this.minimumPercentage) {
                try {
                    this.command.onPass(this)
                    DataHandler.removePoll(this.message.id)
                } catch (e) {
                    console.error(e)
                }
            } else {
                this.command.onFail(this)
                DataHandler.removePoll(this.message.id)
            }
        }, this.timeLeft > 0 ? this.timeLeft : 0)
    }

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
        DataHandler.setPoll(this.format)
    }

    setMessage(message: Message): void {
        this.message = message
        this.updateData()
    }

    addCount(user: GuildMember, value: boolean = false): boolean {
        this.votes.set(user.id, value)
        this.updateData()
        if (this.yesCount > 6) {
            this.done = true
            this.command.onPass(this)
            DataHandler.removePoll(this.message.id)
            return true
        }
        return false
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
        await this.message.edit(this.payload as MessageEditOptions)
        interaction.update({ fetchReply: true })
    }

    get format() {
        return {
            question: this.question,
            initiatorId: this.initiator.user.id,
            votes: Object.fromEntries(this.votes),
            startTimestampUnix: this.startTimestampUnix,
            command: `${this.command.parentCommand}/${this.command.name}`,
            messageId: this.message.id,
            channelId: this.message.channelId,
            params: {
                ...this.params
            }
        }
    }

}
