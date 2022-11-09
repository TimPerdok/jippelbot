import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, embedLength, Guild, GuildMember, MessageReference } from "discord.js";

export default class Poll {

    question: string;
    initiator: any;


    message: any;

    votes = new Map<string, boolean>();
    startTimestampUnix: number;

    maxTime = 86400


    constructor(question: string, initiator: any) {
        this.question = question
        this.initiator = initiator
        this.startTimestampUnix = Math.round(Date.now() / 1000)

        setTimeout(() => {
            this.message.edit({
                embeds: [],
                components: [],
                content: `Vote is afgelopen. ${this.percentage} van de stemmen is voor.`
            })
        }, this.maxTime * 1000)
    }

    get percentage() {
        if (!this.yesCount && !this.noCount) return "0%"
        const pct = Math.round((this.yesCount / (this.yesCount + this.noCount)) * 100)
        return `${pct}%`
    }

    get yesCount(): number {
        return [...this.votes.values()].filter((vote) => vote).length
    }

    get noCount(): number {
        return [...this.votes.values()].filter((vote) => !vote).length
    }

    setRef(message: any) {
        this.message = message
    }

    addCount(user: GuildMember, value: boolean = false) {
        this.votes.set(user.id, value)
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
                    { name: 'Totaal:', value: this.percentage + "", inline: true },
                    { name: 'Vote eindigt op:', value: this.getEndTime()},
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
        this.message.edit(this.getEmbed())
        await interaction.update({ fetchReply: true })
    }


}
