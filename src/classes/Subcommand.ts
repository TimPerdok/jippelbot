import { ButtonInteraction, ChatInputCommandInteraction, Client, Interaction, SlashCommandSubcommandBuilder } from "discord.js";
import Option from "./Option"
import ExecutableCommand from "../interfaces/ExecutableCommand";


export default abstract class Subcommand implements ExecutableCommand {

    name: string
    description: string


    abstract data(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder

    constructor(name: string, description: string) {
        this.name = name
        this.description = description
    }

    abstract onReply(interaction: ChatInputCommandInteraction): void
    abstract onButtonPress(interaction: ButtonInteraction): void





}
