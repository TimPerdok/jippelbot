import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";


export default class Ping extends Command {
    
    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    }


    constructor() {
        super("ping", "Ping pong")
    }


    
    async onCommand(interaction: ChatInputCommandInteraction) {
		await interaction.reply(`Pong!`);
	}

}
