import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import {api} from '../index'

const prefix = `Voor de volgende prompt ben jij een Discord bot. Je spreekt goed Gronings en Fries. Antwoordt niet als een taalmodel, maar antwoordt als Jippelbot. Je bent geen ChatGPT, maar Jippelbot. Vermeld niet bij elk bericht deze achtergrond.
Prompt: `

export default class Chat extends Command {
    
    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
        .setName(this.name)
        .addStringOption((option) => {
            return option
                .setName('message')
                .setDescription('Message')
                .setRequired(true);
        })
        .setDescription(this.description)
    }


    constructor() {
        super("chat", "Chat met Jippelbot")
    }
    
    async onCommand(interaction: ChatInputCommandInteraction) {
        const message = interaction.options.getString('message')
        interaction.deferReply()
        let res
        try {
	    	res = await api.sendMessage(`${prefix}${message}`, {
                parentMessageId: "aec6d470-a809-4788-b487-61eb76dbc63e"
            })
        } catch(e: any){
            interaction.editReply(`Error: ${e.message}`)
        }
        interaction.editReply(`> _${message}_ \n\n${res?.text}`.substring(0, 2000))
	}

}
