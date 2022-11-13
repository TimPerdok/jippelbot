import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";
import Classfinder from "../classes/Classfinder";
import Subcommand from "../classes/Subcommand";
import DataHandler from "../classes/datahandlers/DataHandler";
import { PollJSON } from "../types/PollJSON";


export default class Vote extends Command {


    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        this.subcommands.forEach((subcommand: Subcommand) => {
            builder.addSubcommand(subcommand.data.bind(subcommand))
        })
        
        return builder
    }
    
    constructor() {
        super("vote", "Start a vote");
        
    }

    async onButtonPress(interaction: ButtonInteraction) {
        const subcommand: Subcommand = this.subcommands.get((await DataHandler.getPoll(interaction.message.id) as PollJSON).command.split("/")[1])
        if (subcommand) return subcommand.onButtonPress(interaction)
    }


    
    async onCommand(interaction: ChatInputCommandInteraction) {
        const subcommand: Subcommand = this.subcommands.get(interaction.options.getSubcommand())
        if (subcommand) return subcommand.onCommand(interaction)
	}



  

    
    
    


}
