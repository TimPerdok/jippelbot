import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember } from "discord.js";

export default class Embed {
    title: string;
    description: string;
    initiator: GuildMember;
    fields: APIEmbedField[];

    constructor(title: string, description: string, initiator: GuildMember, fields: APIEmbedField[]) {
        this.title = title
        this.description = description
        this.initiator = initiator
        this.fields = fields
    }

    create() {
        return {
            embeds: [new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(this.title)
                .setDescription(this.description)
                .addFields(...this.fields)
            ]
            , components: [new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('yes')
                        .setLabel('Ja')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('no')
                        .setLabel('Nee')
                        .setStyle(ButtonStyle.Secondary),
                )]
        }

    }

}
