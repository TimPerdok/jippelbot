import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";
import Classfinder from "../classes/Classfinder";
import Subcommand from "../classes/Subcommand";
import DataHandler from "../classes/datahandlers/DataHandler";
import { PollJSON } from "../types/PollJSON";
import {openai} from '../index'

export default class Summon extends Command {


    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option => option.setName("prompt").setDescription("De prompt voor de afbeelding").setRequired(true))
        return builder as SlashCommandBuilder;
    }
    
    constructor() {
        super("imagine", "Imagine een afbeelding");
        
    }

    
    async onCommand(interaction: ChatInputCommandInteraction) {

        const prompt = interaction.options.getString("prompt");
        interaction.deferReply();

        const response = await openai.images.generate({
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "url"
          });
        console.log(response)
        await interaction.editReply({content: `Daar gaat weer 2 cent van Joop... \nPrompt is ${prompt}. \n${response?.data?.[0].url} `});
    }



  

    
    
    


}
