import { Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";
import Classfinder from "../classes/Classfinder";
import Subcommand from "../classes/Subcommand";


export default class Vote extends Command {


    get data(): any {
        const builder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        this.subcommands.forEach((subcommand) => {
            builder.addSubcommand(subcommand.data.bind(subcommand))
        })
        
        return builder
    }
    
    constructor() {
        super("vote", "Start a vote");
        
    }

    async onButtonPress(interaction: any) {
        const subcommand: Subcommand | undefined = this.subcommands.get(interaction.message.interaction.commandName.split(' ')[1])
        if (subcommand) return subcommand.onButtonPress(interaction)
    }


    
    async onReply(interaction: any) {
        
        const subcommand: Subcommand | undefined = this.subcommands.get(interaction.options.getSubcommand())
        if (subcommand) return subcommand.onReply(interaction)
	}



  

    
    
    


}
