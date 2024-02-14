import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";
import Classfinder from "../classes/Classfinder";
import Subcommand from "../classes/Subcommand";
import JSONDataHandler from "../classes/datahandlers/JSONDataHandler";
import { PollJSON } from "../types/PollJSON";


export default class Summon extends Command {


    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption(option => option.setName("user").setDescription("De persoon die je wilt summonen").setRequired(true))
        return builder as SlashCommandBuilder;
    }
    
    constructor() {
        super("summon", "Summon iemand");
    }

    
    async onCommand(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user", true);
        await user.send(`Je wordt gesummoned door ${interaction.user.username} in ${interaction.guild?.name}. Klik <#${interaction.channelId}> om te reageren.`);
        await interaction.reply({content: `Je hebt ${user.username} gesummoned.`, ephemeral: true});
    }



  

    
    
    


}
