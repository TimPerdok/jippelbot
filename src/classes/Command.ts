import { ButtonInteraction, ChatInputCommandInteraction, Client, Interaction, SlashCommandBuilder } from "discord.js";
import ExecutableCommand from "../interfaces/ExecutableCommand";
import Subcommand from "./Subcommand";


export default abstract class Command implements ExecutableCommand {

    public name: string
    public description: string

    subcommands: Subcommand[]


    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }

    constructor(name: string, description: string, subcommands: Subcommand[] = []) {
        this.name = name.toLowerCase()
        this.description = description
        this.subcommands = subcommands
    }

    onCommand(interaction: ChatInputCommandInteraction): void { }
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
