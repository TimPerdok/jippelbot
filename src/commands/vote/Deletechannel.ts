import { ButtonInteraction, ChatInputCommandInteraction, Client, GuildMember, Interaction, MessageCreateOptions, MessageEditOptions, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import DiscordBot from "../../classes/Bot";
import JSONDataHandler from "../../classes/datahandlers/JSONDataHandler";
import Poll from "../../classes/Poll";
import PollSubcommand from "../../interfaces/PollCarrier";
import { ServerConfig } from "../../types/ServerdataJSON";



export default class Deletechannel extends PollSubcommand  {

    constructor() {
        super("deletechannel", "Delete a channel", "vote");
    }
    
    onPass(poll: Poll): void {
        const channel: TextChannel = DiscordBot.client.channels.cache.get(poll.params.channelId) as TextChannel
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Het kanaal ${channel.name} is verwijderd! ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
        })
        channel.delete()
    }
    onFail(poll: Poll): void {
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Deze vote is niet doorgevoerd. ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
        })
    }


    async onCommand(interaction: ChatInputCommandInteraction) {
        const channels = (interaction.member as GuildMember).guild.channels.cache
        const toBeDeletedChannel = channels.get(interaction.options.getChannel('channel').id)
        const poll = new Poll({
            question: `Moet het kanaal ${toBeDeletedChannel} verwijderd worden?`,
            initiator: interaction.member as GuildMember,
            command: this,
            params: { channelId: toBeDeletedChannel.id }
        });
        const serverData = await JSONDataHandler.getServerdata(interaction.guildId as string) as ServerConfig
        const voteChannel = channels.get(serverData.voteChannel) as TextChannel
        await interaction.reply({ content: "Je vote is aangemaakt!", ephemeral: true }) as MessageEditOptions
        const message = await voteChannel.send({ ...poll.payload, fetchReply: true } as MessageCreateOptions);
        poll.setMessage(message)
        this.polls.set(message.id, poll)
    }

    async onButtonPress(interaction: ButtonInteraction) {
        const poll = this.polls.get(interaction.message.id)
        if (!poll) return
        const done = poll.addCount(interaction.member as GuildMember, interaction.customId === 'yes')
        if (!done) poll.updateMessage(interaction)
    }

    data(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption((option: SlashCommandChannelOption) => {
                return option
                    .setName('channel')
                    .setDescription('The channel to rename')
                    .setRequired(true)
            })
    }



}
