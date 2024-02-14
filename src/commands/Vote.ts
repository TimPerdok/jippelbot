import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";
import Classfinder from "../classes/Classfinder";
import Subcommand from "../classes/Subcommand";
import JSONDataHandler from "../classes/datahandlers/JSONDataHandler";
import { PollJSON } from "../types/PollJSON";
import DiscordBot from "../classes/Bot";


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
        const guildId = interaction.guildId
        const poll = await DiscordBot.getInstance().dataHandlers.poll.getItem(guildId ?? "", interaction.message.id) as PollJSON
        if (!poll) return interaction.reply({content: "Poll not found", ephemeral: true})
        const subcommand = this.subcommands.get(poll.command)
        if (subcommand) return subcommand.onButtonPress(interaction)
    }


    
    async onCommand(interaction: ChatInputCommandInteraction) {
        const subcommand = this.subcommands.get(interaction.options.getSubcommand())
        if (subcommand) return subcommand.onCommand(interaction)
	}



  

    
    
    


}
