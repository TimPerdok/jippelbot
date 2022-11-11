import { ButtonInteraction, ChatInputCommandInteraction, Client, GuildMember, Interaction, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import DataHandler from "../../classes/DataHandler";
import Poll from "../../classes/Poll";
import Subcommand from "../../classes/Subcommand";



export default class Renamechannel extends Subcommand {

    polls: Map<string, Poll>

    constructor() {
        super("renamechannel", "Rename a channel");
        this.polls = new Map<string, Poll>();
        DataHandler.getPolls(this.name).then((polls: Map<string, Poll>) => {
            this.polls = polls
        })
    }

    
    async onReply(interaction: ChatInputCommandInteraction) {
        const channels = (interaction.member as GuildMember).guild.channels.cache
        const channel = channels.get(interaction.options.getChannel('channel').id)
        const newName = interaction.options.getString('name')
        const poll = new Poll(`Moet het kanaal ${channel} vernoemd worden naar '${newName}'`, interaction.member as GuildMember, this.name);
        const message = await interaction.reply({...poll.payload, fetchReply: true})
        this.polls.set(message.id, poll)
        poll.setRef(message)
        poll.onPass = (poll) => {
            poll.message.edit({
                embeds: [],
                components: [],
                content: `De naam van het kanaal ${channel} is veranderd naar '${newName}!'`
            })
            channel.setName(newName)
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
