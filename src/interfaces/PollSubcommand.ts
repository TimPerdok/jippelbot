import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, MessageCreateOptions, MessagePayload, SlashCommandSubcommandBuilder } from "discord.js";
import Subcommand from "../classes/Subcommand";
import Poll from "../classes/data/polls/Poll";
import { ActionParams, VoteAction, VoteEvent } from "../classes/data/VoteActions";
import DiscordBot from "../classes/Bot";
import CustomIdentifier from "../classes/CustomIdentifier";
import PollEmbed from "../classes/data/polls/PollEmbed";
import { PollJSON } from "../types/PollJSON";

export type PollChannelType = "GUILD_TEXT" | "GUILD_VOICE"
export default abstract class PollSubcommand<T extends VoteAction<ActionParams>> extends Subcommand {

    abstract createAction(params: ActionParams): T

    abstract parseInteractionToParams(interaction: ChatInputCommandInteraction): ActionParams | Promise<ActionParams>

    static get DEFAULT_END_DATE() {
        return Math.round(((new Date().getTime()) + 1000 * 60 * 60 * 24) / 1000)
    } 

    constructor(name: string, description: string) {
        super(name, description)
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const params = await this.parseInteractionToParams(interaction)
        const poll = Poll.new(this.createAction(params), PollSubcommand.DEFAULT_END_DATE, interaction.user.id, interaction.channelId)
        const guildId = interaction.guildId
        if (!guildId) return console.error("No guildId")
        const embed = PollEmbed.create(poll, interaction.user)
        const channel = interaction.channel
        if (!channel) return console.error("No channel")
        const message = await interaction.channel.send({
            embeds: [embed], components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(CustomIdentifier.toCustomId<VoteEvent>({
                                command: "vote",
                                subcommand: this.name,
                                payload: {
                                    isYes: true
                                }
                            }))
                            .setLabel('Ja')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId(CustomIdentifier.toCustomId<VoteEvent>({
                                command: "vote",
                                subcommand: this.name,
                                payload: {
                                    isYes: false
                                }
                            }))
                            .setLabel('Nee')
                            .setStyle(ButtonStyle.Danger),
                    )
            ]
        })
        poll.save(message.id)
        interaction.reply({ content: "Vote aangemaakt!", ephemeral: true })
    }

    async onButtonPress(interaction: ButtonInteraction) {
        const isYes = CustomIdentifier.fromCustomId<VoteEvent>(interaction.customId).payload.isYes
        const guildId = interaction.guildId
        if (!guildId) return console.error("No guildId")
        const messageId = interaction.message.id
        if (!messageId) return console.error("No messageId")
        interaction.deferUpdate()
        
        const poll = Poll.fromItem(await DiscordBot.getInstance().dataHandlers.poll.getItem(guildId, messageId) as PollJSON<T>)
        if (!poll) return console.error("No poll")
        poll.addVote(interaction.user.id, isYes)
        const pollEmbed = PollEmbed.fromEmbed(interaction.message.embeds[0], poll)
        
        if (!interaction.channel) return console.error("No channel")
        const voteMessage = interaction.message.channel.messages.cache.get(poll.id)
        voteMessage?.edit({ embeds: [pollEmbed] })
    }


}
