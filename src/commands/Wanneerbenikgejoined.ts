import { ChatInputCommandInteraction, Client, GuildMember, Interaction } from "discord.js";
import Command from "../classes/Command";


export default class Wanneerbenikgejoined extends Command {
    

    constructor() {
        super("wanneerbenikgejoined", "wanneer je wilt weten wanneer je bent gejoined")	
    }


    async onCommand(interaction: ChatInputCommandInteraction) {
		return await interaction.reply({content: `Jij bent gejoined op ${(interaction.member as GuildMember).joinedAt}.`, ephemeral: true});
	}

}
