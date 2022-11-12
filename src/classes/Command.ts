import { ButtonInteraction, ChatInputCommandInteraction, Client, Interaction, SlashCommandBuilder } from "discord.js";
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
        Classfinder.getSubcommands(this.name).then((subcommands: Subcommand[]) => {
            subcommands.forEach((subcommand: Subcommand) => {
                this.subcommands.set(subcommand.name, subcommand)
            });
        })
    }


    onReply(interaction: ChatInputCommandInteraction): void { }
    onButtonPress(interaction: ButtonInteraction): void { }



    toJSON() {
        return JSON.stringify(
            {
                name: this.name,
                description: this.description,
                execute: () => { }
            }
        )
    }

}
