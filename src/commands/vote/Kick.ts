import { APIApplicationCommandOptionChoice, ButtonInteraction, ChannelType, ChatInputCommandInteraction, Client, DiscordAPIError, Guild, GuildMember, Interaction, MessageCreateOptions, MessageEditOptions, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextChannel, User, VoiceChannel } from "discord.js";
import DiscordBot from "../../classes/Bot";
import DataHandler from "../../classes/datahandlers/DataHandler";
import Poll from "../../classes/Poll";
import Subcommand from "../../classes/Subcommand";
import PollCarrier from "../../interfaces/PollCarrier";
import PollSubcommand from "../../interfaces/PollCarrier";
import { ServerdataJSON } from "../../types/ServerdataJSON";



export default class Addchannel extends PollSubcommand  {


    constructor() {
        super("kick", "Kick a person", "vote");
    }

    
    onPass(poll: Poll): void {
        const guild: Guild = DiscordBot.client.guilds.cache.get(poll.message.guild.id) as Guild
        const userId: string = poll.params.userId
        const member: GuildMember = guild.members.cache.get(userId) as GuildMember
        try {
            member.kick();
            poll.message.edit({
                embeds: [],
                components: [],
                content: `De user ${member.user.username} is gekickt! ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
            })
        } catch (error) {
            poll.message.edit({
                embeds: [],
                components: [],
                content: `Deze vote zou doorgevoerd worden maar er is een error ontstaan. ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel}). Error: ${error.message}`
            })
        }
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
        const user: User = interaction.options.getUser('user')
        const poll = new Poll({
            question: `Moet de user ${user.username} gekickt worden?`,
            initiator: interaction.member as GuildMember,
            command: this,
            params: { userId: user.id }
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
            .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
            
    }



}
