import { Client, SlashCommandBuilder } from "discord.js";
import ExecutableCommand from "../interfaces/ExecutableCommand";
import Classfinder from "./Classfinder";
import Subcommand from "./Subcommand";


export default abstract class Command implements ExecutableCommand {

    public name: string
    public description: string

    subcommands: Map<string, Subcommand>
    
    
    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    }
    
    

    constructor(name: string, description: string) {
        this.name = name.toLowerCase()
        this.description = description
        this.subcommands = new Map<string, any>();
        Classfinder.getClasses("commands/vote").then((subcommands) => {
            subcommands.forEach(async ({ value }: any) => {
                if (!value) return console.error("Subcommand error")
                const subcommand = new value.default()
                this.subcommands.set(subcommand.name, subcommand)
            });
        }) 
    }
    onReply(client: Client<boolean>, interaction: any): any {}
    onButtonPress(client: Client<boolean>, interaction: any): any {}




    

    
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
