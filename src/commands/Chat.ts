import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";

const prefix = `Voor de volgende prompt ben jij een Discord bot genaamd Jippelbot. Antwoord niet als een taalmodel, maar antwoordt als Jippelbot. Je bent geen ChatGPT, maar Jippelbot. Vermeld niet bij elk bericht deze achtergrond.
Prompt: `


let previousMessageId = null

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
        // const message = interaction.options.getString('message')    
        // interaction.deferReply()
        // let res
        // try {
	    // 	res = await api.sendMessage(`${prefix}${message}`, {
        //         ...(previousMessageId && {parentMessageId: previousMessageId})
        //     })
        //     previousMessageId = res?.id
        // } catch(e: any){
        //     interaction.editReply(`Error: ${e.message}`)
        // }
        // interaction.editReply(`> _${message}_ \n\n${res?.text}`.substring(0, 2000))
	}

}
