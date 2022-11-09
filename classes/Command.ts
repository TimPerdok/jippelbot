import { Client, SlashCommandBuilder } from "discord.js";


export default abstract class Command {

    public name: string
    public description: string
    
    
    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    }
    
    

    constructor(name: string, description: string) {
        this.name = name.toLowerCase()
        this.description = description
    }



    public async onReply(client: Client, interaction: any) {
    }

    public async onButtonPress(client: Client, interaction: any) {
    }

    
    toJSON() {
        return JSON.stringify(
            {
                name: this.name,
                description: this.description,
                execute: ()=>{}
            }
        )
    }

}
