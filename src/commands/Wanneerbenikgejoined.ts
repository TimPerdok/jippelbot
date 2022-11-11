import { ChatInputCommandInteraction, Client, GuildMember, Interaction } from "discord.js";
import Command from "../classes/Command";


export default class Wanneerbenikgejoined extends Command {
    

    constructor() {
        super("wanneerbenikgejoined", "wanneer je wilt weten wanneer je bent gejoined")	
    }


    async onReply(interaction: ChatInputCommandInteraction) {
		return await interaction.reply(`Jij bent gejoined op ${(interaction.member as GuildMember).joinedAt}.`);
	}

}
