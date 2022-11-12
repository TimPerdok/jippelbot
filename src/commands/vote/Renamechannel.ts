import { ButtonInteraction, ChatInputCommandInteraction, Client, GuildMember, Interaction, MessageCreateOptions, MessageEditOptions, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextChannel } from "discord.js";
import DataHandler from "../../classes/datahandlers/DataHandler";
import Poll from "../../classes/Poll";
import Subcommand from "../../classes/Subcommand";
import { ServerdataJSON } from "../../types/ServerdataJSON";



export default class Renamechannel extends Subcommand {

    polls: Map<string, Poll>

    constructor() {
        super("renamechannel", "Rename a channel");
        this.polls = new Map<string, Poll>();
        DataHandler.getPolls(this.name).then((polls: Map<string, Poll>) => {
            this.polls = polls
        })
    }

    
    async onCommand(interaction: ChatInputCommandInteraction) {
        const channels = (interaction.member as GuildMember).guild.channels.cache
        const toBeRenamedChannel = channels.get(interaction.options.getChannel('channel').id)
        const newName = interaction.options.getString('name')
        const poll = new Poll(`Moet het kanaal ${toBeRenamedChannel} vernoemd worden naar '${newName}'`, interaction.member as GuildMember, this.name);
        const serverData = await DataHandler.getServerdata(interaction.guildId as string) as ServerdataJSON
        const voteChannel = channels.get(serverData.voteChannel) as TextChannel
        await interaction.reply({content: "Je vote is aangemaakt!", ephemeral: true}) as MessageEditOptions
        const message = await voteChannel.send({...poll.payload, fetchReply: true} as MessageCreateOptions);
        this.polls.set(message.id, poll)
        poll.setRef(message)
        poll.onPass = (poll) => {
            poll.message.edit({
                embeds: [],
                components: [],
                content: `De naam van het kanaal ${toBeRenamedChannel} is veranderd naar '${newName}!'`
            })
            toBeRenamedChannel.setName(newName)
        }
        poll.onFail = (poll) => {
            poll.message.edit({
                embeds: [],
                components: [],
                content: `Er is geen meerderheid gevonden voor het veranderen van de naam van het kanaal ${toBeRenamedChannel} naar '${newName}'`
            })
        }
    }

    async onButtonPress(interaction: ButtonInteraction) {
        const poll = this.polls.get(interaction.message.id)
        if (!poll) return
        poll.addCount(interaction.member as GuildMember, interaction.customId === 'yes')
        poll.updateMessage(interaction)
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
