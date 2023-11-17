import { ButtonInteraction, ChatInputCommandInteraction, Client, GuildMember, Interaction, MessageCreateOptions, MessageEditOptions, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import DiscordBot from "../../classes/Bot";
import DataHandler from "../../classes/datahandlers/DataHandler";
import Poll from "../../classes/Poll";
import Subcommand from "../../classes/Subcommand";
import PollCarrier from "../../interfaces/PollCarrier";
import PollSubcommand from "../../interfaces/PollCarrier";
import { ServerdataJSON } from "../../types/ServerdataJSON";



export default class Renamechannel extends PollSubcommand  {



    constructor() {
        super("renamechannel", "Rename a channel", "vote");
    }
    
    onPass(poll: Poll): void {
        const channel: TextChannel = DiscordBot.client.channels.cache.get(poll.params.channelId) as TextChannel
        poll.message.edit({
            embeds: [],
            components: [],
            content: `De naam van het kanaal ${channel.name} is veranderd naar '${poll.params.newName}!' ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
        })
        channel.setName(poll.params.newName)
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
        const toBeRenamedChannel = channels.get(interaction.options.getChannel('channel').id)
        const newName = interaction.options.getString('name')
        const poll = new Poll({
            question: `Moet het kanaal ${toBeRenamedChannel} vernoemd worden naar '${newName}'`,
            initiator: interaction.member as GuildMember,
            command: this,
            params: { newName, channelId: toBeRenamedChannel.id }
        });
        const serverData = await DataHandler.getServerdata(interaction.guildId as string) as ServerdataJSON
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
            .addStringOption((option: SlashCommandStringOption) => {
                return option
                    .setName('name')
                    .setDescription('The new name of the channel')
                    .setRequired(true)
            })
    }



}
