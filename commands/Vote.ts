import { Client, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";


export default class Vote extends Command {

    poll: any = null;

    polls = new Map<string, Poll>();

    get data(): any {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((subcommand) => {
            return subcommand
                .setName('renamechannel')
                .setDescription('Rename a channel')
                .addChannelOption((option) => {
                    return option
                        .setName('channel')
                        .setDescription('The channel to rename')
                        .setRequired(true)
                })
                .addStringOption((option) => {
                    return option
                        .setName('name')
                        .setDescription('The new name of the channel')
                        .setRequired(true)
                })
        })
        
    }
    
    
    constructor() {
        super("vote", "Start a vote")
    }

    async onButtonPress(client: Client, interaction: any) {
        const poll = this.polls.get(interaction.message.id)
        if (!poll) return
        poll.addCount(interaction.user, interaction.customId === 'yes')
        poll.update(interaction)
    }


    
    async onReply(client: Client, interaction: any) {
        try {
            const channels = interaction.member.guild.channels.cache
            const channel = channels.get(interaction.options.getChannel('channel').id)
            const newName = interaction.options.getString('name')
            const poll = new Poll(`Moet het kanaal ${channel} vernoemd worden naar '${newName}'`, interaction.member);
		    const message = await interaction.reply({...poll.getEmbed(), fetchReply: true})
            this.polls.set(message.id, poll)
            poll.setRef(message)
        } catch (error) {
            console.error(error)
            if (error instanceof DiscordAPIError) {
                return await interaction.reply(`Weehhhhh ik heb geen permissies :( @joop `);
            }
        }


        

	}



  

    
    
    


}
