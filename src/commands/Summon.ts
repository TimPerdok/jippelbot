import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";


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
