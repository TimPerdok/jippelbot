import { Client } from "discord.js";
import Poll from "../../classes/Poll";
import Subcommand from "../../classes/Subcommand";



export default class Renamechannel extends Subcommand {

    polls: Map<string, Poll>

    constructor() {
        super("renamechannel", "Rename a channel");
        this.polls = new Map<string, Poll>();
    }

    async renameChannel(poll: Poll) {
        const channel = poll.message.interaction.channel
        const newName = poll.message.interaction.options.getString('name')
        try {
            await channel.setName(newName)
        } catch (error) {
            console.log(error)
            await poll.message.edit({content: 'De kanaalnaam kon niet veranderd worden, waarschijnlijk geen permission, blame joop in ieder geval'})
        }
        
    }
    
    async onReply(client: Client<boolean>, interaction: any) {
        const channels = interaction.member.guild.channels.cache
        const channel = channels.get(interaction.options.getChannel('channel').id)
        const newName = interaction.options.getString('name')
        const poll = new Poll(`Moet het kanaal ${channel} vernoemd worden naar '${newName}'`, interaction.member);
        const message = await interaction.reply({...poll.getEmbed(), fetchReply: true})
        this.polls.set(message.id, poll)
        poll.onPass = this.renameChannel
        poll.onFail = async (poll: Poll)=>{
            console.log('fail')
        }
        
        poll.setRef(message)
    }

    async onButtonPress(client: Client, interaction: any) {
        const poll = this.polls.get(interaction.message.id)
        if (!poll) return
        poll.addCount(interaction.user, interaction.customId === 'yes')
        poll.update(interaction)
    }


    data(subcommand: any) {
        return subcommand
        .setName(this.name)
        .setDescription(this.description)
        .addChannelOption((option: any) => {
            return option
                .setName('channel')
                .setDescription('The channel to rename')
                .setRequired(true)
        })
        .addStringOption((option: any) => {
            return option
                .setName('name')
                .setDescription('The new name of the channel')
                .setRequired(true)
        })
    }



}
