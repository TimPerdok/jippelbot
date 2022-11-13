import { ActionRow, ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonInteraction, ButtonStyle, Channel, ChannelType, EmbedBuilder, embedLength, Guild, GuildMember, Interaction, Message, MessageEditOptions, MessagePayload, MessageReference, TextChannel, VoiceChannel } from "discord.js";
import MessageCarrier, { DataJSON, Payload } from "../interfaces/MessageCarrier";
import { PollSubcommand } from "../types/PollSubcommand";
import Classfinder from "./Classfinder";
import DataHandler from "./datahandlers/DataHandler";


export default class Poll implements MessageCarrier {

    subcommand: string
    question: string;
    initiator: GuildMember;

    message: Message;

    votes: Map<string, boolean>
    startTimestampUnix: number;

    // maxTime = 86400
    maxTime = 10

    minimumPercentage = 0.50

    params: { [key: string]: string } = {};

    get timeLeft(): number {
        return (this.startTimestampUnix + this.maxTime) * 1000 - Date.now()
    }

    constructor(question: string, initiator: GuildMember, subcommand: PollSubcommand, startTimestampUnix?: number, votes: Map<string, boolean> = new Map<string, boolean>(), message: Message = null, params: { [key: string]: string } = {}) {
        this.question = question
        this.initiator = initiator
        this.subcommand = subcommand.name
        this.startTimestampUnix = startTimestampUnix ?? Math.round(Date.now() / 1000)
        this.votes = votes
        this.message = message
        this.params = params
        setTimeout(async () => {
            if (!subcommand) subcommand = await Classfinder.getSubcommand(subcommand.parentCommand, subcommand.name) as unknown as PollSubcommand
            if (this.percentage > this.minimumPercentage) {
                try {
                    subcommand.onPass(this)
                    DataHandler.removePoll(this.message.id)
                } catch (e) {
                    console.error(e)
                }
            } else {
                subcommand.onFail(this)
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

    setRef(message: Message): void {
        this.message = message
        this.updateData()
    }

    addCount(user: GuildMember, value: boolean = false): void {
        this.votes.set(user.id, value)
        this.updateData()
        if (this.yesCount < 6) return
        Classfinder.getSubcommand("vote", this.subcommand).then((subcommandObject: PollSubcommand)=>{
            subcommandObject.onPass(this)
            DataHandler.removePoll(this.message.id)
        })
        
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
            subcommand: this.subcommand,
            messageId: this.message.id,
            channelId: this.message.channelId,
            params: {
                ...this.params
            }
        }
    }

}
